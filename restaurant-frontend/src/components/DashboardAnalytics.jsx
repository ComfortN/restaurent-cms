import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const DashboardAnalytics = ({ restaurants, reservations }) => {
  const screenWidth = Dimensions.get('window').width - 30; // Padding on sides

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#FFE1BB',
    backgroundGradientFrom: '#FFE1BB',
    backgroundGradientTo: '#FFE1BB',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(180, 78, 19, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(180, 78, 19, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#B44E13'
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Platform Analytics</Text>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Growth</Text>
        <LineChart
          data={monthlyData}
          width={300}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue Overview</Text>
        <BarChart
          data={monthlyData}
          width={260}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={30}
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R45,678</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>89%</Text>
          <Text style={styles.statLabel}>Active Restaurants</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1,234</Text>
          <Text style={styles.statLabel}>New Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Avg. Rating</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 15,
    flex: 1,
    backgroundColor: '#F7BF90'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#B44E13'
  },
  chartContainer: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#B44E13'
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  statCard: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B44E13'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  }
});

export default DashboardAnalytics;