import { StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')
const coverSize = width * 0.6

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#9090a0',
  },
  headerText: {
    fontSize: 14,
    color: '#9090a0',
  },
  timerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerIcon: {
    fontSize: 20,
    color: '#9090a0',
  },
  // Timer panel
  timerPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  timerClose: {
    fontSize: 16,
    color: '#9090a0',
  },
  timerSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerSlider: {
    flex: 1,
  },
  timerValue: {
    width: 64,
    textAlign: 'center',
    color: '#7c6aef',
    fontSize: 15,
  },
  timerPresets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  timerPresetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
  },
  timerPresetActive: {
    backgroundColor: '#7c6aef',
  },
  timerPresetText: {
    fontSize: 12,
    color: '#9090a0',
  },
  timerPresetTextActive: {
    color: '#ffffff',
  },
  timerConfirm: {
    backgroundColor: '#7c6aef',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerConfirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Visual
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    width: coverSize,
    height: coverSize,
    borderRadius: coverSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a3e',
  },
  errorContainer: {
    width: coverSize,
    height: coverSize,
    borderRadius: coverSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorText: {
    fontSize: 14,
    color: '#9090a0',
    marginTop: 12,
  },
  coverContainer: {
    width: coverSize,
    height: coverSize,
    borderRadius: coverSize / 2,
    overflow: 'hidden',
    shadowColor: '#7c6aef',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  coverImage: {
    width: coverSize,
    height: coverSize,
  },
  coverPulse: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: coverSize / 2 + 8,
    borderWidth: 2,
    borderColor: '#7c6aef50',
  },
  noiseContainer: {
    width: coverSize,
    height: coverSize,
    borderRadius: coverSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noiseEmoji: {
    fontSize: 80,
  },
  placeholderContainer: {
    width: coverSize,
    height: coverSize,
    borderRadius: coverSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a3e',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  courseDesc: {
    fontSize: 14,
    color: '#9090a0',
    textAlign: 'center',
    marginTop: 8,
  },
  // Progress
  progressContainer: {
    width: '100%',
    marginTop: 32,
  },
  progressSlider: {
    width: '100%',
  },
  progressTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressTime: {
    fontSize: 12,
    color: '#9090a0',
  },
  // Controls
  controlsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  volumeIcon: {
    fontSize: 18,
    color: '#9090a0',
  },
  volumeSlider: {
    flex: 1,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  controlBtn: {
    padding: 8,
  },
  controlIcon: {
    fontSize: 20,
    color: '#9090a0',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7c6aef60',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c6aef',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonIcon: {
    fontSize: 32,
    color: '#ffffff',
    marginLeft: 4, // nudge for play icon
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loopBtn: {
    padding: 4,
  },
  loopText: {
    fontSize: 13,
    color: '#9090a0',
  },
  loopTextActive: {
    color: '#7c6aef',
  },
  sleepTimerText: {
    fontSize: 12,
    color: '#7c6aef',
  },
})
