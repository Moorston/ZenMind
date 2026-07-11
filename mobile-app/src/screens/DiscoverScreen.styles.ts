import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3e',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 18,
    color: '#9090a0',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    padding: 0,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1a1a3e',
  },
  categoryChipActive: {
    backgroundColor: '#7c6aef',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#9090a0',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9090a0',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  courseCount: {
    fontSize: 13,
    color: '#9090a0',
  },
  noiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  noiseCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noiseEmoji: {
    fontSize: 40,
  },
  noiseName: {
    fontSize: 14,
    color: '#ffffff',
  },
  courseList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: 112,
    height: 112,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 13,
    color: '#9090a0',
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#7c6aef20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#7c6aef',
  },
  badgeSecondary: {
    backgroundColor: '#2dd4bf20',
  },
  badgeTextSecondary: {
    fontSize: 12,
    color: '#2dd4bf',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9090a0',
  },
})
