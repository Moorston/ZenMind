import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitleText: {
    fontSize: 14,
    color: '#9090a0',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0,
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c6aef20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkinIconText: {
    fontSize: 18,
    color: '#7c6aef',
  },
  checkinTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  checkinSubtitle: {
    fontSize: 13,
    color: '#9090a0',
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#f9731620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
  },
  quizBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  quizIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2dd4bf20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizText: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  quizSubtitle: {
    fontSize: 13,
    color: '#9090a0',
    marginTop: 2,
  },
  quizBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quizBadgeText: {
    fontSize: 12,
    color: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  viewAllText: {
    fontSize: 14,
    color: '#7c6aef',
  },
  recommendCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  recommendImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  recommendInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recommendTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  recommendDesc: {
    fontSize: 13,
    color: '#9090a0',
    marginTop: 4,
  },
  recommendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#7c6aef',
  },
  playButton: {
    backgroundColor: '#7c6aef',
    margin: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  noiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
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
    fontSize: 32,
  },
  noiseName: {
    fontSize: 14,
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c6aef',
  },
  statLabel: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 4,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 64,
    gap: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barFill: {
    width: '60%',
    backgroundColor: '#7c6aef',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 4,
  },
  courseScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  courseRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  courseCard: {
    width: 140,
    flexShrink: 0,
  },
  courseImage: {
    width: 140,
    height: 96,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  courseInfo: {
    padding: 8,
  },
  courseTitle: {
    fontSize: 13,
    color: '#ffffff',
  },
  courseDuration: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 2,
  },
})
