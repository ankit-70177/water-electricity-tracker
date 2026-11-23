import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function App() {
  const waterUsage = 90;
const waterGoal = 150;

const electricityUsage = 4;
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
            <Text style={styles.subtitle}>
              Let's make every drop count.
            </Text>
          </View>

          <View style={styles.profile}>
            <Text style={styles.profileText}>A</Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            Your resources, your impact.
          </Text>

          <Text style={styles.introDescription}>
            Track your daily consumption and build habits
            that help save water and electricity.
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
<Text style={styles.usageValue}>
  {waterUsage} L
</Text>

<Text style={styles.goalText}>
  Goal: {waterGoal} L
</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
  style={[
    styles.waterProgress,
    { width: `${waterPercentage}%` },
  ]}
/>
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
             <Text style={styles.usageValue}>
  {electricityUsage} kWh
</Text>

<Text style={styles.goalText}>
  Goal: {electricityGoal} kWh
</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
  style={[
    styles.electricityProgress,
    { width: `${electricityPercentage}%` },
  ]}
/>
            </View>

            <Text style={styles.progressText}>
  {electricityPercentage}% of your daily goal used
</Text>
          </View>
          {/* Daily Goal Summary */}
<View style={styles.summaryCard}>
  <Text style={styles.summaryTitle}>Daily Goal Summary</Text>

  <Text style={styles.summaryText}>
    You have used {waterPercentage}% of your water goal
    and {electricityPercentage}% of your electricity
    goal today.
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

  <Text style={styles.tipTitle}>
    Save water while brushing
  </Text>

  <Text style={styles.tipDescription}>
    Turn off the tap while brushing your teeth.
    A running tap can waste several litres of water
    in just a few minutes.
  </Text>
</View>

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
    color: '#326748',
  },

  introCard: {
    backgroundColor: '#E5EFE7',
    marginHorizontal: 24,
    padding: 22,
    borderRadius: 20,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  introDescription: {
    fontSize: 14,
    color: '#577364',
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
    fontWeight: 'bold',
    color: '#173C2B',
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#718477',
    marginTop: 6,
    marginBottom: 18,
  },

  waterCard: {
    backgroundColor: '#E3F2FA',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  electricityCard: {
    backgroundColor: '#FFF1D9',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  waterIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#C5E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  electricityIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFE1A8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 23,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#718477',
    marginTop: 3,
  },

  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 24,
    marginBottom: 14,
  },

  usageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  goalText: {
    fontSize: 14,
    color: '#577364',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },

  waterProgress: {
    width: '40%',
    height: '100%',
    backgroundColor: '#45A5D6',
    borderRadius: 10,
  },

  electricityProgress: {
    width: '48%',
    height: '100%',
    backgroundColor: '#E9A634',
    borderRadius: 10,
  },

  progressText: {
    fontSize: 13,
    color: '#577364',
    marginTop: 10,
  },
    summaryCard: {
    backgroundColor: '#E5EFE7',
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#173C2B',
  },

  summaryText: {
    fontSize: 14,
    color: '#577364',
    lineHeight: 22,
    marginTop: 10,
  },

  summaryHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#326748',
    marginTop: 12,
  },

  tipCard: {
    backgroundColor: '#F0F3DF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  tipLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#718044',
    letterSpacing: 1,
  },

  tipTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#35451F',
    marginTop: 12,
  },

  tipDescription: {
    fontSize: 14,
    color: '#65734D',
    lineHeight: 22,
    marginTop: 8,
  },
});