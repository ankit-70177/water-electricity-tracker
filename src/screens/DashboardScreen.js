import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Convert a backend history record into the format the existing UI expects
const mapBackendRecord = (record, type) => ({
  id: record.id,
  amount: Number(record.amount),
  date: record.usage_date,
  time: record.created_at
    ? new Date(record.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '',
  type, // 'water' or 'electricity'
});

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  // ── Consumption state (source of truth: PostgreSQL) ──
  const [waterUsage, setWaterUsage] = useState(0);
  const [electricityUsage, setElectricityUsage] = useState(0);
  const [waterHistory, setWaterHistory] = useState([]);
  const [electricityHistory, setElectricityHistory] = useState([]);

  // ── Input fields ──
  const [waterInput, setWaterInput] = useState('');
  const [electricityInput, setElectricityInput] = useState('');
  const [waterGoalInput, setWaterGoalInput] = useState('');
  const [electricityGoalInput, setElectricityGoalInput] = useState('');

  // ── Goals (source of truth: AsyncStorage — local preference) ──
  const [waterGoal, setWaterGoal] = useState(150);
  const [electricityGoal, setElectricityGoal] = useState(5);
  const [goalsLoaded, setGoalsLoaded] = useState(false);

  // ── Loading / error states ──
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [isAddingElectricity, setIsAddingElectricity] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ────────────────────────────────────────────────────────
  //  Load goals from AsyncStorage (local preferences only)
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const savedGoals = await AsyncStorage.getItem('userGoals');
        if (savedGoals !== null && isMountedRef.current) {
          const goals = JSON.parse(savedGoals);
          setWaterGoal(goals.waterGoal ?? 150);
          setElectricityGoal(goals.electricityGoal ?? 5);
        }
      } catch (error) {
        console.log('Error loading goals:', error);
      } finally {
        if (isMountedRef.current) {
          setGoalsLoaded(true);
        }
      }
    };

    loadGoals();
  }, []);

  // ────────────────────────────────────────────────────────
  //  Save goals to AsyncStorage whenever they change
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!goalsLoaded) return;

    const saveGoals = async () => {
      try {
        await AsyncStorage.setItem(
          'userGoals',
          JSON.stringify({ waterGoal, electricityGoal })
        );
      } catch (error) {
        console.log('Error saving goals:', error);
      }
    };

    saveGoals();
  }, [goalsLoaded, waterGoal, electricityGoal]);

  // ────────────────────────────────────────────────────────
  //  Fetch all dashboard data from PostgreSQL
  //  Called on mount and after every successful submission
  // ────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (isMountedRef.current) {
      setDashboardError('');
    }

    try {
      // Fire all four requests in parallel; allSettled keeps valid data if one endpoint fails
      const [waterTodayRes, elecTodayRes, waterHistRes, elecHistRes] =
        await Promise.allSettled([
          api.get('/api/water/today'),
          api.get('/api/electricity/today'),
          api.get('/api/water/history'),
          api.get('/api/electricity/history'),
        ]);

      if (!isMountedRef.current) return;

      const settled = [waterTodayRes, elecTodayRes, waterHistRes, elecHistRes];

      // If any endpoint reports unauthorized (401/403), follow AuthContext logout flow
      const unauthorized = settled.find(
        (res) =>
          res.status === 'rejected' &&
          (res.reason?.response?.status === 401 ||
            res.reason?.response?.status === 403)
      );
      if (unauthorized) {
        await logout();
        return;
      }

      if (waterTodayRes.status === 'fulfilled') {
        setWaterUsage(waterTodayRes.value.data.totalUsage ?? 0);
      }
      if (elecTodayRes.status === 'fulfilled') {
        setElectricityUsage(elecTodayRes.value.data.totalUsage ?? 0);
      }
      if (waterHistRes.status === 'fulfilled') {
        setWaterHistory(
          (waterHistRes.value.data.data ?? []).map((r) =>
            mapBackendRecord(r, 'water')
          )
        );
      }
      if (elecHistRes.status === 'fulfilled') {
        setElectricityHistory(
          (elecHistRes.value.data.data ?? []).map((r) =>
            mapBackendRecord(r, 'electricity')
          )
        );
      }

      const firstError = settled.find((res) => res.status === 'rejected');
      if (firstError) {
        const err = firstError.reason;
        console.log('Dashboard fetch error:', err?.message);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Could not load your consumption data. Please check your connection.';
        setDashboardError(msg);
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.log('Dashboard fetch error:', error.message);

      const msg =
        error.response?.data?.message ||
        error.message ||
        'Could not load your consumption data. Please check your connection.';
      setDashboardError(msg);
    } finally {
      if (isMountedRef.current) {
        setIsDashboardLoading(false);
      }
    }
  }, [logout]);

  // ── Fetch data when the dashboard first opens ──
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ────────────────────────────────────────────────────────
  //  Submit water usage to backend
  // ────────────────────────────────────────────────────────
  const handleAddWater = async () => {
    const amount = Number(waterInput);

    if (!waterInput || isNaN(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid positive number for water consumption.'
      );
      return;
    }

    setIsAddingWater(true);
    try {
      await api.post('/api/water', { amount });

      if (!isMountedRef.current) return;
      setWaterInput('');

      // Re-fetch authoritative data from backend
      await fetchDashboardData();
    } catch (error) {
      if (!isMountedRef.current) return;
      console.log('Add water usage error:', error.message);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to record water usage on server.';
      Alert.alert('Submission Error', msg);
    } finally {
      if (isMountedRef.current) {
        setIsAddingWater(false);
      }
    }
  };

  // ────────────────────────────────────────────────────────
  //  Submit electricity usage to backend
  // ────────────────────────────────────────────────────────
  const handleAddElectricity = async () => {
    const amount = Number(electricityInput);

    if (!electricityInput || isNaN(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid positive number for electricity consumption.'
      );
      return;
    }

    setIsAddingElectricity(true);
    try {
      await api.post('/api/electricity', { amount });

      if (!isMountedRef.current) return;
      setElectricityInput('');

      // Re-fetch authoritative data from backend
      await fetchDashboardData();
    } catch (error) {
      if (!isMountedRef.current) return;
      console.log('Add electricity usage error:', error.message);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to record electricity usage on server.';
      Alert.alert('Submission Error', msg);
    } finally {
      if (isMountedRef.current) {
        setIsAddingElectricity(false);
      }
    }
  };

  // ────────────────────────────────────────────────────────
  //  Logout
  // ────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      `Signed in as ${user?.email || 'User'}.\nAre you sure you want to log out?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  // ────────────────────────────────────────────────────────
  //  Derived values (unchanged from original dashboard)
  // ────────────────────────────────────────────────────────
  const waterPercentage = Math.round((waterUsage / waterGoal) * 100);

  const electricityPercentage = Math.round(
    (electricityUsage / electricityGoal) * 100
  );
  const waterTip =
    waterPercentage <= 50
      ? "Great job! You're using water efficiently. Keep maintaining this habit."
      : waterPercentage <= 80
      ? "You're making good progress. Try avoiding unnecessary water usage."
      : waterPercentage <= 100
      ? "You're approaching your daily goal. Be mindful of water usage."
      : "You've exceeded your water goal. Try reducing unnecessary water consumption.";

  const electricityTip =
    electricityPercentage <= 50
      ? "Excellent! You're keeping electricity consumption low. Keep it up."
      : electricityPercentage <= 80
      ? "Good progress! Turn off lights and appliances when not needed."
      : electricityPercentage <= 100
      ? "You're approaching your daily electricity goal. Try reducing unnecessary power usage."
      : "You've exceeded your electricity goal. Switch off unused appliances to reduce consumption.";

  const remainingWater = waterGoal - waterUsage;
  const remainingElectricity = electricityGoal - electricityUsage;

  // ── Weekly analytics (uses backend history) ──
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateKey = `${year}-${month}-${day}`;

    return {
      date: dateKey,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });

  const weeklyWaterData = last7Days.map((day) =>
    waterHistory
      .filter((entry) => entry.date === day.date)
      .reduce((total, entry) => total + Number(entry.amount), 0)
  );

  const weeklyElectricityData = last7Days.map((day) =>
    electricityHistory
      .filter((entry) => entry.date === day.date)
      .reduce((total, entry) => total + Number(entry.amount), 0)
  );

  const weeklyWaterTotal = weeklyWaterData.reduce(
    (sum, amount) => sum + amount,
    0
  );

  const weeklyElectricityTotal = weeklyElectricityData.reduce(
    (sum, amount) => sum + amount,
    0
  );

  // ────────────────────────────────────────────────────────
  //  Initial loading screen
  // ────────────────────────────────────────────────────────
  if (isDashboardLoading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingLabel}>Loading your dashboard...</Text>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────
  //  Error screen with retry
  // ────────────────────────────────────────────────────────
  if (dashboardError && waterUsage === 0 && electricityUsage === 0 && waterHistory.length === 0 && electricityHistory.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar style="dark" />
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorLabel}>{dashboardError}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            setIsDashboardLoading(true);
            fetchDashboardData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        <Pressable
          style={styles.logoutLink}
          onPress={handleLogout}
        >
          <Text style={styles.logoutLinkText}>Log Out</Text>
        </Pressable>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────
  //  Main dashboard (all existing UI preserved exactly)
  // ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user?.name
                ? `Hello, ${user.name.split(' ')[0]} 👋`
                : 'Good afternoon 👋'}
            </Text>
            <Text style={styles.subtitle}>Let's make every drop count.</Text>
          </View>

          <Pressable
            style={styles.profile}
            onPress={handleLogout}
            accessibilityLabel="User profile, tap to log out"
          >
            <Text style={styles.profileText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </Text>
          </Pressable>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Your resources, your impact.</Text>

          <Text style={styles.introDescription}>
            Track your daily consumption and build habits that help save water
            and electricity.
          </Text>
        </View>

        {/* Today's Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Usage</Text>
          <Text style={styles.sectionSubtitle}>
            Keep an eye on your daily consumption.
          </Text>

          {/* Water Card */}
          <View style={styles.waterCard}>
            <View style={styles.cardHeader}>
              <View style={styles.waterIcon}>
                <Text style={styles.iconText}>💧</Text>
              </View>

              <View>
                <Text style={styles.cardTitle}>Water</Text>
                <Text style={styles.cardSubtitle}>Daily consumption</Text>
              </View>
            </View>

            <View style={styles.usageRow}>
              <Text style={styles.usageValue}>{waterUsage} L</Text>

              <Text style={styles.goalText}>Goal: {waterGoal} L</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[styles.waterProgress, { width: `${Math.min(waterPercentage, 100)}%` }]}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.usageInput}
                placeholder="Enter litres"
                keyboardType="numeric"
                value={waterInput}
                onChangeText={setWaterInput}
                editable={!isAddingWater}
              />

              <Pressable
                style={[
                  styles.addButton,
                  isAddingWater && styles.addButtonDisabled,
                ]}
                disabled={isAddingWater}
                onPress={handleAddWater}
              >
                {isAddingWater ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>+ Add</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.progressText}>
              {waterPercentage}% of your daily goal used
            </Text>
          </View>

          {/* Electricity Card */}
          <View style={styles.electricityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.electricityIcon}>
                <Text style={styles.iconText}>⚡</Text>
              </View>

              <View>
                <Text style={styles.cardTitle}>Electricity</Text>
                <Text style={styles.cardSubtitle}>Daily consumption</Text>
              </View>
            </View>

            <View style={styles.usageRow}>
              <Text style={styles.usageValue}>{electricityUsage} kWh</Text>

              <Text style={styles.goalText}>Goal: {electricityGoal} kWh</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.electricityProgress,
                  { width: `${Math.min(electricityPercentage, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.usageInput}
                placeholder="Enter kWh"
                keyboardType="numeric"
                value={electricityInput}
                onChangeText={setElectricityInput}
                editable={!isAddingElectricity}
              />

              <Pressable
                style={[
                  styles.addButton,
                  { backgroundColor: '#D89B26' },
                  isAddingElectricity && styles.addButtonDisabled,
                ]}
                disabled={isAddingElectricity}
                onPress={handleAddElectricity}
              >
                {isAddingElectricity ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>+ Add</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.progressText}>
              {electricityPercentage}% of your daily goal used
            </Text>
          </View>

          {/* Daily Goal Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Daily Goal Summary</Text>

            <Text style={styles.summaryText}>
              You have used {waterPercentage}% of your water goal and{' '}
              {electricityPercentage}% of your electricity goal today.
            </Text>

            <Text style={styles.summaryHighlight}>
              {remainingWater >= 0 && remainingElectricity >= 0
                ? "You're still within both daily targets! 🎉"
                : "You've exceeded a daily goal. Let's work on reducing usage! 🌱"}
            </Text>
          </View>

          <View style={styles.goalSettingsCard}>
            <Text style={styles.goalSettingsTitle}>🎯 Daily Goal Settings</Text>

            <Text style={styles.goalLabel}>Water Goal (Litres)</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.usageInput}
                placeholder="Enter water goal"
                keyboardType="numeric"
                value={waterGoalInput}
                onChangeText={setWaterGoalInput}
              />

              <Pressable
                style={styles.addButton}
                onPress={() => {
                  const goal = Number(waterGoalInput);

                  if (goal > 0) {
                    setWaterGoal(goal);
                    setWaterGoalInput('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </Pressable>
            </View>

            <Text style={styles.goalLabel}>Electricity Goal (kWh)</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.usageInput}
                placeholder="Enter electricity goal"
                keyboardType="numeric"
                value={electricityGoalInput}
                onChangeText={setElectricityGoalInput}
              />

              <Pressable
                style={[styles.addButton, { backgroundColor: '#D89B26' }]}
                onPress={() => {
                  const goal = Number(electricityGoalInput);

                  if (goal > 0) {
                    setElectricityGoal(goal);
                    setElectricityGoalInput('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </Pressable>
            </View>
          </View>

          {/* Water Saving Tip */}
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>💧 WATER SAVING TIP</Text>

            <Text style={styles.tipTitle}>Save Water</Text>

            <Text style={styles.tipDescription}>{waterTip}</Text>
          </View>

          {/* Electricity Saving Tip */}
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>⚡ ENERGY SAVING TIP</Text>

            <Text style={styles.tipTitle}>Save Electricity</Text>

            <Text style={styles.tipDescription}>{electricityTip}</Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Usage 📊</Text>

          {waterHistory.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyName}>💧 Water</Text>
                <Text style={styles.historyAmount}>Added {entry.amount} L</Text>
              </View>

              <Text style={styles.historyTime}>
                {entry.date} • {entry.time}
              </Text>
            </View>
          ))}

          {electricityHistory.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyName}>⚡ Electricity</Text>
                <Text style={styles.historyAmount}>
                  Added {entry.amount} kWh
                </Text>
              </View>

              <Text style={styles.historyTime}>
                {entry.date} • {entry.time}
              </Text>
            </View>
          ))}

          {/* Weekly Analytics */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsTitle}>Weekly Analytics 📊</Text>
            <Text style={styles.analyticsSubtitle}>
              Your consumption over the last 7 days
            </Text>

            {/* Weekly Water Total */}
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>
                💧 Weekly Water Usage
              </Text>
              <Text style={styles.analyticsTotal}>{weeklyWaterTotal} L</Text>

              <LineChart
                data={{
                  labels: last7Days.map((day) => day.label),
                  datasets: [{ data: weeklyWaterData }],
                }}
                width={screenWidth - 64}
                height={220}
                yAxisSuffix=" L"
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#2E7D32',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>

            {/* Weekly Electricity Total */}
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>
                ⚡ Weekly Electricity Usage
              </Text>
              <Text style={styles.analyticsTotal}>
                {weeklyElectricityTotal.toFixed(2)} kWh
              </Text>

              <LineChart
                data={{
                  labels: last7Days.map((day) => day.label),
                  datasets: [{ data: weeklyElectricityData }],
                }}
                width={screenWidth - 64}
                height={220}
                yAxisSuffix=" kWh"
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 179, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#FFB300',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>

          {waterHistory.length === 0 && electricityHistory.length === 0 && (
            <Text style={styles.emptyHistory}>
              No usage entries yet. Start tracking your consumption!
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F5',
    paddingHorizontal: 32,
  },

  loadingLabel: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B8273',
    fontWeight: '500',
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  errorLabel: {
    fontSize: 15,
    color: '#556E5F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  logoutLink: {
    marginTop: 8,
    padding: 8,
  },

  logoutLinkText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },

  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B8273',
    marginTop: 6,
  },

  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCEBE1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  introCard: {
    marginHorizontal: 24,
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  introDescription: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 10,
    lineHeight: 20,
  },

  section: {
    marginTop: 28,
    paddingHorizontal: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#6B8273',
    marginTop: 4,
    marginBottom: 16,
  },

  waterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  electricityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  waterIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  electricityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 20,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#7A9182',
    marginTop: 2,
  },

  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },

  usageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  goalText: {
    fontSize: 13,
    color: '#7A9182',
    fontWeight: '500',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#EDF3EE',
    borderRadius: 5,
    overflow: 'hidden',
  },

  waterProgress: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 5,
  },

  electricityProgress: {
    height: '100%',
    backgroundColor: '#F5B041',
    borderRadius: 5,
  },

  progressText: {
    fontSize: 12,
    color: '#6B8273',
    marginTop: 10,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#173C2B',
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 14,
    color: '#556E5F',
    lineHeight: 20,
  },

  summaryHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 10,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },

  usageInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D7E3DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FBF9',
    marginRight: 10,
    color: '#173C2B',
  },

  addButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },

  addButtonDisabled: {
    opacity: 0.6,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  tipLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 1,
    marginBottom: 6,
  },

  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#173C2B',
    marginBottom: 6,
  },

  tipDescription: {
    fontSize: 13,
    color: '#556E5F',
    lineHeight: 18,
  },

  goalSettingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  goalSettingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#173C2B',
    marginBottom: 10,
  },

  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B6354',
    marginTop: 8,
  },

  historySection: {
    marginTop: 20,
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#173C2B',
    marginBottom: 12,
  },

  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  historyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  historyAmount: {
    fontSize: 12,
    color: '#6B8273',
    marginTop: 2,
  },

  historyTime: {
    fontSize: 11,
    color: '#8A9E91',
  },

  emptyHistory: {
    fontSize: 13,
    color: '#8A9E91',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },

  analyticsSection: {
    marginTop: 25,
    marginBottom: 20,
  },

  analyticsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  analyticsSubtitle: {
    fontSize: 13,
    color: '#6B8273',
    marginTop: 4,
    marginBottom: 16,
  },

  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  analyticsTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: '#173C2B',
  },

  chart: {
    borderRadius: 16,
    marginLeft: -10,
  },
});
