import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const rawIssues = [
  {
    id: 1,
    title: 'Цахилгааны залгуур халж байна',
    description: 'Агуулахын өрөөний розетка асах үед халж байна.',
    status: 'pending',
    location: 'Агуулах - Өрөө 102',
    created_at: '2025-05-06T08:30:00Z',
  },
  {
    id: 2,
    title: 'Цэвэрлэгээний хэрэгсэл дууссан',
    description: 'Бие засах өрөөний ариун цэврийн хэрэгсэл байхгүй.',
    status: 'resolved',
    location: 'Оффисын 2-р давхар',
    created_at: '2025-05-05T15:10:00Z',
  },
  {
    id: 3,
    title: 'Цонхны шил хагарсан',
    description: 'Салхины улмаас цонхны шил цуурсан.',
    status: 'pending',
    location: 'Үйлдвэрийн хойд хаалга',
    created_at: '2025-05-04T12:00:00Z',
  },
];

const groupByDate = (issues: any[]) => {
  const grouped: { [date: string]: any[] } = {};

  issues.forEach((issue) => {
    const date = new Date(issue.created_at).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(issue);
  });

  return Object.entries(grouped)
    .sort((a, b) => new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime())
    .map(([title, data]) => ({ title, data }));
};

const IssueListScreen = () => {
  const [sections] = useState(groupByDate(rawIssues));

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'resolved' ? styles.resolved : styles.pending,
          ]}
        >
          {item.status === 'resolved' ? 'Шийдсэн' : 'Хүлээгдэж буй'}
        </Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.meta}>Ажлын байр: {item.location}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 80 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

export default IssueListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '400',
    marginBottom: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#374151',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontWeight: '400',
    fontSize: 16,
    color: '#111827',
    flex: 1,
    flexWrap: 'wrap',
  },
  status: {
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  resolved: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: '#374151',
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
  },
});
