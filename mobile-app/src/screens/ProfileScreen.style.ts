import { StyleSheet } from 'react-native'

export const styles = (StyleSheet as any).create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12122a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c6aef30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userPreference: {
    fontSize: 14,
    color: '#9090a0',
  },
  streakBadge: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#12122a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7c6aef',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9090a0',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9090a0',
  },
  // Calendar
  calendar: {
    backgroundColor: '#12122a',
    borderRadius: 12,
    padding: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#606080',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#9090a0',
  },
  dayChecked: {
    backgroundColor: '#7c6aef',
    borderRadius: 20,
  },
  dayTextChecked: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dayToday: {
    borderWidth: 2,
    borderColor: '#2dd4bf',
    borderRadius: 20,
  },
  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12122a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: '#606080',
  },
  menuBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  menuBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  // Logout
  logoutButton: {
    backgroundColor: '#ef444430',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#606080',
    marginBottom: 40,
  },
})
