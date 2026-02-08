import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, ScrollView, 
  Dimensions, Animated, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { getUserReports, BASE_URL } from "../../services/api";

const { width } = Dimensions.get("window");

// Define Interface for the recruiter to see you know professional TS
interface User {
  id: number;
  name: string;
  email?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        const res = await getUserReports(parsedUser.id);
        if (res.success) setReports(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const reportCount = reports.length;
  const level = Math.floor(reportCount / 5) + 1;
  const xpProgress = (reportCount % 5) / 5;
  const resolvedCount = reports.filter((r: any) => r.status === 'resolved').length;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [300, 150],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  // FIX: Type the color parameter as a Tuple
  const renderBadge = (icon: string, label: string, minReports: number, color: [string, string, ...string[]]) => {
    const isUnlocked = reportCount >= minReports;
    return <BadgeCard icon={icon} label={label} isUnlocked={isUnlocked} color={color} />;
  };

  const renderReportCard = ({ item, index }: any) => (
    <ReportCard item={item} index={index} />
  );

  if (loading) {
    return (
      <LinearGradient colors={["#2E7D32", "#357739", "#62b665"] as const} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchData}
              tintColor="#FFF"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Header */}
          <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
            <LinearGradient
              colors={["#2E7D32", "#357739", "#62b665"] as const}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <BlurView intensity={15} tint="dark" style={styles.headerBlur}>
                <Animated.View style={[styles.avatarSection, { transform: [{ scale: avatarScale }] }]}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"] as const}
                      style={styles.avatarGlow}
                    />
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"] as const}
                      style={styles.levelBadge}
                    >
                      <Text style={styles.levelNumber}>{level}</Text>
                      <Text style={styles.levelText}>LVL</Text>
                    </LinearGradient>
                  </View>

                  <Text style={styles.userName}>{user?.name}</Text>
                  <View style={styles.titleBadge}>
                    <Text style={styles.titleText}>
                      {level >= 5 ? "🏆 Eco Champion" : "🌱 Eco Warrior"}
                    </Text>
                  </View>
                </Animated.View>

                
                
              </BlurView>
            </LinearGradient>
          </Animated.View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <LinearGradient
              colors={["#2E7D32", "#4CAF50"] as const}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <Text style={styles.statNumber}>{reportCount}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
              <View style={styles.statPulse} />
            </LinearGradient>

            <LinearGradient
              colors={["#1976D2", "#2196F3"] as const}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statNumber}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
              <View style={styles.statPulse} />
            </LinearGradient>

            <LinearGradient
              colors={["#F57C00", "#FF9800"] as const}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⚡</Text>
              </View>
              <Text style={styles.statNumber}>{level * 100}</Text>
              <Text style={styles.statLabel}>XP Points</Text>
              <View style={styles.statPulse} />
            </LinearGradient>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏅 Achievements</Text>
              <View style={styles.achievementProgress}>
                <Text style={styles.achievementCount}>
                  {[1, 5, 10, 20].filter(min => reportCount >= min).length}/4
                </Text>
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesContainer}
            >
              {renderBadge("🌱", "First Step", 1, ["#4CAF50", "#8BC34A"])}
              {renderBadge("🛡️", "Civic Guard", 5, ["#2196F3", "#64B5F6"])}
              {renderBadge("🔥", "Eco Hero", 10, ["#F57C00", "#FFB74D"])}
              {renderBadge("👑", "Guardian", 20, ["#9C27B0", "#BA68C8"])}
            </ScrollView>
          </View>

          {/* Impact Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Impact Summary</Text>
            <BlurView intensity={20} tint="light" style={styles.impactCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"] as const}
                style={styles.impactGradient}
              >
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Reports Submitted</Text>
                  <Text style={styles.impactValue}>{reportCount}</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Success Rate</Text>
                  <Text style={styles.impactValue}>
                    {reportCount > 0 ? Math.round((resolvedCount / reportCount) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Community Rank</Text>
                  <Text style={styles.impactValue}>Top {level * 10}%</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Activity Log */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Activity Log</Text>
            <FlatList
              data={reports}
              renderItem={renderReportCard}
              keyExtractor={(item: any) => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyTitle}>No Reports Yet</Text>
                  <Text style={styles.emptyText}>
                    Start making a difference in your community!
                  </Text>
                </View>
              }
            />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </>
  );
}

const BadgeCard = ({ icon, label, isUnlocked, color }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.badgeCard, { transform: [{ scale: scaleAnim }] }]}>
      {isUnlocked ? (
        <LinearGradient colors={color} style={styles.badgeGradient}>
          <Text style={styles.badgeIcon}>{icon}</Text>
          <Text style={styles.badgeLabel}>{label}</Text>
          <View style={styles.badgeGlow} />
        </LinearGradient>
      ) : (
        <View style={styles.badgeLocked}>
          <Text style={styles.badgeIconLocked}>🔒</Text>
          <Text style={styles.badgeLabelLocked}>{label}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const ReportCard = ({ item, index }: any) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isResolved = item.status === 'resolved';
  // FIX: Added 'as const' to status colors
  const statusColor = isResolved 
    ? (["#4CAF50", "#8BC34A"] as const) 
    : (["#FF9800", "#FFB74D"] as const);

  return (
    <Animated.View
      style={[
        styles.reportCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={statusColor}
        style={styles.reportAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.reportContent}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.reportDate}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <LinearGradient
            colors={statusColor}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>
              {isResolved ? "✓" : "⏳"} {item.status || "Pending"}
            </Text>
          </LinearGradient>
        </View>
        
        {item.admin_notes && isResolved && (
          <View style={styles.adminNote}>
            <Text style={styles.adminNoteIcon}>💬</Text>
            <Text style={styles.adminNoteText} numberOfLines={2}>
              {item.admin_notes}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ... Styles remain exactly as you had them
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
  },
  headerBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatarGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -5,
    left: -5,
    opacity: 0.5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#667eea",
  },
  levelBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
  },
  levelText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFF",
  },
  userName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  titleBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  titleText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  xpContainer: {
    width: width - 60,
    marginTop: 10,
  },
  xpInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  xpValue: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
  xpBarContainer: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 5,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
  },
  xpGradient: {
    flex: 1,
  },
  statsSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statPulse: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  achievementProgress: {
    backgroundColor: "#667eea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  achievementCount: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  badgesContainer: {
    gap: 15,
  },
  badgeCard: {
    marginRight: 15,
  },
  badgeGradient: {
    width: 110,
    height: 130,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
  },
  badgeGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    top: -20,
    right: -20,
  },
  badgeLocked: {
    width: 110,
    height: 130,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E0E0",
  },
  badgeIconLocked: {
    fontSize: 48,
    marginBottom: 10,
    opacity: 0.5,
  },
  badgeLabelLocked: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textAlign: "center",
  },
  impactCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  impactGradient: {
    padding: 20,
  },
  impactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  impactLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  impactValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1a1a2e",
  },
  impactDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  reportAccent: {
    width: 6,
  },
  reportContent: {
    flex: 1,
    padding: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  adminNote: {
    flexDirection: "row",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    gap: 10,
  },
  adminNoteIcon: {
    fontSize: 16,
  },
  adminNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});