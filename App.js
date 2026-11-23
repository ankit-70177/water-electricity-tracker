import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useState } from 'react';

export default function App() {
const [waterUsage, setWaterUsage] = useState(60);
const [electricityUsage, setElectricityUsage] = useState(2.4);
const [waterInput, setWaterInput] = useState('');
const [electricityInput, setElectricityInput] = useState('');
const [waterHistory, setWaterHistory] = useState([]);
const [electricityHistory, setElectricityHistory] = useState([]);

const waterGoal = 150;
const electricityGoal = 5;

const waterPercentage = Math.round(
  (waterUsage / waterGoal) * 100
);

const electricityPercentage = Math.round(
  (electricityUsage / electricityGoal) * 100
);

const remainingWater = waterGoal - waterUsage;
const remainingElectricity = electricityGoal - electricityUsage;
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good afternoon 👋</Text>
            <Text style={styles.subtitle}>Let's make every drop count.</Text>
          </View>

          <View style={styles.profile}>
            <Text style={styles.profileText}>A</Text>
          </View>
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
                style={[styles.waterProgress, { width: `${waterPercentage}%` }]}
              />
            </View>
                        <View style={styles.inputRow}>
  <TextInput
    style={styles.usageInput}
    placeholder="Enter litres"
    keyboardType="numeric"
    value={waterInput}
    onChangeText={setWaterInput}
  />

  <Pressable
    style={styles.addButton}
    onPress={() => {
  const amount = Number(waterInput);

  if (amount > 0) {
    setWaterUsage(waterUsage + amount);

    setWaterHistory([
      {
        id: Date.now(),
        amount: amount,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      ...waterHistory,
    ]);

    setWaterInput('');
  }
}}
  >
    <Text style={styles.addButtonText}>+ Add</Text>
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
                  { width: `${electricityPercentage}%` },
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
  />

  <Pressable
    style={[styles.addButton, { backgroundColor: '#D89B26' }]}
    onPress={() => {
  const amount = Number(electricityInput);

  if (amount > 0) {
    setElectricityUsage(electricityUsage + amount);

    setElectricityHistory([
      {
        id: Date.now(),
        amount: amount,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      ...electricityHistory,
    ]);

    setElectricityInput('');
  }
}}
  >
    <Text style={styles.addButtonText}>+ Add</Text>
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
              You have used {waterPercentage}% of your water goal and{" "}
              {electricityPercentage}% of your electricity goal today.
            </Text>

            <Text style={styles.summaryHighlight}>
              {remainingWater >= 0 && remainingElectricity >= 0
                ? "You're still within both daily targets! 🎉"
                : "You've exceeded a daily goal. Let's work on reducing usage! 🌱"}
            </Text>
          </View>

          {/* Saving Tip */}
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>🌱 DAILY SAVING TIP</Text>

            <Text style={styles.tipTitle}>Save water while brushing</Text>

            <Text style={styles.tipDescription}>
              Turn off the tap while brushing your teeth. A running tap can
              waste several litres of water in just a few minutes.
            </Text>
          </View>
        </View>
        <View style={styles.historySection}>
  <Text style={styles.historyTitle}>Recent Usage 📊</Text>

  {waterHistory.map((entry) => (
    <View key={entry.id} style={styles.historyItem}>
      <View>
        <Text style={styles.historyName}>💧 Water</Text>
        <Text style={styles.historyAmount}>
          Added {entry.amount} L
        </Text>
      </View>

      <Text style={styles.historyTime}>{entry.time}</Text>
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

      <Text style={styles.historyTime}>{entry.time}</Text>
    </View>
  ))}

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
    backgroundColor: "#F5F8F5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },

  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#173C2B",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B8273",
    marginTop: 6,
  },

  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DCEBE1",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#326748",
  },

  introCard: {
    backgroundColor: "#E5EFE7",
    marginHorizontal: 24,
    padding: 22,
    borderRadius: 20,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173C2B",
  },

  introDescription: {
    fontSize: 14,
    color: "#577364",
    lineHeight: 22,
    marginTop: 10,
  },

  section: {
    marginHorizontal: 24,
    marginTop: 28,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173C2B",
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "#718477",
    marginTop: 6,
    marginBottom: 18,
  },

  waterCard: {
    backgroundColor: "#E3F2FA",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  electricityCard: {
    backgroundColor: "#FFF1D9",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  waterIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#C5E5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  electricityIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFE1A8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 23,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#173C2B",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#718477",
    marginTop: 3,
  },

  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 24,
    marginBottom: 14,
  },

  usageValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#173C2B",
  },

  goalText: {
    fontSize: 14,
    color: "#577364",
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
  },

  waterProgress: {
    width: "40%",
    height: "100%",
    backgroundColor: "#45A5D6",
    borderRadius: 10,
  },

  electricityProgress: {
    width: "48%",
    height: "100%",
    backgroundColor: "#E9A634",
    borderRadius: 10,
  },

  progressText: {
    fontSize: 13,
    color: "#577364",
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "#E5EFE7",
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173C2B",
  },

  summaryText: {
    fontSize: 14,
    color: "#577364",
    lineHeight: 22,
    marginTop: 10,
  },

  summaryHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#326748",
    marginTop: 12,
  },

  tipCard: {
    backgroundColor: "#F0F3DF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  tipLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#718044",
    letterSpacing: 1,
  },

  tipTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#35451F",
    marginTop: 12,
  },

  tipDescription: {
    fontSize: 14,
    color: "#65734D",
    lineHeight: 22,
    marginTop: 8,
  },
  inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 18,
  gap: 10,
},

usageInput: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 12,
  fontSize: 14,
  color: '#173C2B',
},

addButton: {
  backgroundColor: '#287EAC',
  paddingHorizontal: 18,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

addButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 'bold',
},
historySection: {
  backgroundColor: '#FFFFFF',
  padding: 20,
  borderRadius: 20,
  marginTop: 20,
  marginBottom: 20,
},

historyTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#173C2B',
  marginBottom: 15,
},

historyItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},

historyName: {
  fontSize: 15,
  fontWeight: '600',
  color: '#173C2B',
},

historyAmount: {
  fontSize: 13,
  color: '#777777',
  marginTop: 4,
},

historyTime: {
  fontSize: 13,
  color: '#888888',
},

emptyHistory: {
  fontSize: 14,
  color: '#777777',
  textAlign: 'center',
  paddingVertical: 15,
},
});
