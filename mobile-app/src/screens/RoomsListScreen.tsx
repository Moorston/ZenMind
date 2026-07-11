import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, TextInput,
  Modal, FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { RoomsAPI, type Room } from '@/api/rooms'
import { CoursesAPI, type Course } from '@/api/courses'
import { useAuthStore } from '@/store/useAuthStore'

export function RoomsListScreen() {
  const navigation = useNavigation<any>()
  const { isLoggedIn, user } = useAuthStore()
  const currentUserId = user?.id

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await RoomsAPI.getRooms()
      const activeRooms = (res.data || []).filter(r => r.status !== 'ended')
      setRooms(activeRooms)
    } catch (err) {
      console.error('[Rooms] fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleJoin = (room: Room) => {
    if (!isLoggedIn) {
      Alert.alert('提示', '请先登录')
      return
    }
    if (room.status === 'playing') {
      Alert.alert(
        '房间播放中',
        '该房间已在播放中，加入将同步到当前进度。是否继续？',
        [
          { text: '取消', style: 'cancel' },
          { text: '加入', onPress: () => navigation.navigate('Player', { roomId: room.id }) },
        ]
      )
      return
    }
    navigation.navigate('Player', { roomId: room.id })
  }

  const openCreateModal = async () => {
    if (!isLoggedIn) {
      Alert.alert('提示', '请先登录')
      return
    }
    // 先加载课程，完成后再打开 Modal
    setCoursesLoading(true)
    try {
      const res = await CoursesAPI.getCourses({ pageSize: 50 })
      setCourses(res.data || [])
    } catch (err) {
      console.error('[Rooms] load courses failed:', err)
    } finally {
      setCoursesLoading(false)
    }
    setShowCreateModal(true)
  }

  const handleCreate = async () => {
    if (!isLoggedIn || !currentUserId) {
      Alert.alert('提示', '请先登录')
      return
    }
    if (!newRoomName.trim()) {
      Alert.alert('提示', '请输入房间名称')
      return
    }
    if (!selectedCourseId) {
      Alert.alert('提示', '请选择一门冥想课程')
      return
    }

    setCreating(true)
    try {
      const res = await RoomsAPI.createRoom({
        name: newRoomName.trim(),
        hostId: currentUserId,
        courseId: selectedCourseId,
      })
      if (res.data) {
        setShowCreateModal(false)
        setNewRoomName('')
        setSelectedCourseId(null)
        navigation.navigate('Player', { roomId: res.data.id, courseId: selectedCourseId })
      }
    } catch (err) {
      console.error('[Rooms] create failed:', err)
      Alert.alert('创建失败', '请稍后再试')
    } finally {
      setCreating(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return { text: '等待中', color: '#2dd4bf' }
      case 'playing': return { text: '进行中', color: '#7c6aef' }
      default: return { text: '已结束', color: '#9090a0' }
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>多人冥想</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={openCreateModal}
        >
          <Text style={styles.createBtnText}>创建房间</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7c6aef" />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧘</Text>
          <Text style={styles.emptyText}>暂无房间</Text>
          <Text style={styles.emptySubtext}>创建第一个房间，邀请朋友一起冥想</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.roomList}
          contentContainerStyle={styles.roomListContent}
          showsVerticalScrollIndicator={false}
        >
          {rooms.map((room) => {
            const status = getStatusLabel(room.status)
            return (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() => handleJoin(room)}
              >
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                </View>
                <View style={styles.roomFooter}>
                  <Text style={styles.participantText}>👥 {room.participantCount} 人</Text>
                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => handleJoin(room)}
                  >
                    <Text style={styles.joinBtnText}>加入</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}

      {/* Create Room Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建房间</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="输入房间名称"
              placeholderTextColor="#9090a0"
              value={newRoomName}
              onChangeText={setNewRoomName}
              maxLength={30}
            />
            <Text style={{ color: '#9090a0', fontSize: 13, marginBottom: 8 }}>选择冥想课程</Text>
            {coursesLoading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#7c6aef" />
                <Text style={{ color: '#9090a0', fontSize: 13, marginTop: 8 }}>加载课程中...</Text>
              </View>
            ) : courses.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ color: '#9090a0', fontSize: 13 }}>暂无可用课程</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    marginBottom: 6,
                    backgroundColor: selectedCourseId === course.id ? '#7c6aef20' : '#0a0a1a',
                    borderWidth: selectedCourseId === course.id ? 1 : 0,
                    borderColor: '#7c6aef',
                  }}
                  onPress={() => setSelectedCourseId(course.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{course.title}</Text>
                    <Text style={{ color: '#9090a0', fontSize: 12, marginTop: 2 }}>{course.duration}分钟</Text>
                  </View>
                  {selectedCourseId === course.id && (
                    <Text style={{ color: '#7c6aef', fontSize: 16 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              </ScrollView>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, creating && styles.modalConfirmBtnDisabled]}
                disabled={creating}
                onPress={handleCreate}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>创建</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  createBtn: {
    backgroundColor: '#7c6aef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9090a0',
    textAlign: 'center',
  },
  roomList: {
    flex: 1,
  },
  roomListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  roomCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantText: {
    fontSize: 13,
    color: '#9090a0',
  },
  joinBtn: {
    backgroundColor: '#7c6aef',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0a0a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a4e',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#9090a0',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7c6aef',
    alignItems: 'center',
  },
  modalConfirmBtnDisabled: {
    opacity: 0.6,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})
