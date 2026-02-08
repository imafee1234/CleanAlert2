import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, Image, Dimensions,
  ActivityIndicator, TouchableOpacity, RefreshControl, Animated, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { getReports, getLeaderboard, toggleLike, BASE_URL } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setCurrentUserId(JSON.parse(userData).id);

    const [repRes, leadRes] = await Promise.all([getReports(), getLeaderboard()]);
    if (repRes.success) setReports(repRes.data);
    if (leadRes.success) setLeaders(leadRes.data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(React.useCallback(() => { fetchData(); }, []));

  const handleLike = async (reportId: number) => {
    if (!currentUserId) return;

    setReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id === reportId) {
          const isLiked = report.isLikedByMe;
          return {
            ...report,
            likeCount: isLiked ? report.likeCount - 1 : report.likeCount + 1,
            isLikedByMe: !isLiked,
          };
        }
        return report;
      })
    );

    try {
      const res = await toggleLike(currentUserId, reportId);
      if (!res.success) fetchData();
    } catch (error) {
      console.error("Like failed:", error);
      fetchData();
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerWrapper,
        { opacity: headerOpacity, transform: [{ scale: headerScale }] }
      ]}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={["#2E7D32", "#357739", "#62b665",]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <BlurView intensity={20} tint="light" style={styles.heroBlur}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.welcomeText}>Hello, Hero! 👋</Text>
              <Text style={styles.heroSubtext}>Making a difference today</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>7</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Impact Stats */}
      <View style={styles.statsRow}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{reports.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
          <View style={styles.statPulse} />
        </LinearGradient>

        <LinearGradient
          colors={["#1976D2", "#2196F3"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>
            {reports.filter(r => r.status === 'resolved').length}
          </Text>
          <Text style={styles.statLabel}>Solved</Text>
          <View style={styles.statPulse} />
        </LinearGradient>

        <LinearGradient
          colors={["#F57C00", "#FF9800"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={styles.statValue}>
            {reports.reduce((sum, r) => sum + (r.likeCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Upvotes</Text>
          <View style={styles.statPulse} />
        </LinearGradient>
      </View>

      {/* Top Contributors */}
      <View style={styles.leadersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Top Contributors</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={leaders.slice(0, 5)}
          renderItem={({ item, index }) => (
            <LeaderCard item={item} index={index} />
          )}
          contentContainerStyle={styles.leadersList}
        />
      </View>

      <Text style={styles.feedTitle}>🌟 Recent Activity</Text>
    </Animated.View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isLiked = item.isLikedByMe > 0 || item.isLikedByMe === true;
    return <ReportCard item={item} isLiked={isLiked} onLike={handleLike} index={index} />;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#2E7D32", "#357739", "#62b665"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Animated.FlatList
          data={reports}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchData}
              tintColor="#66eab3"
            />
          }
        />
      </View>
    </>
  );
}

const LeaderCard = ({ item, index }: { item: any; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const colors = [
    ["#FFD700", "#FFA500"],
    ["#C0C0C0", "#A8A8A8"],
    ["#CD7F32", "#B8860B"],
  ] as const;

  return (
    <Animated.View style={[styles.leaderCard, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={colors[index] || ["#667eea", "#764ba2"]}
        style={styles.leaderGradient}
      >
        <View style={styles.leaderBadge}>
          <Text style={styles.leaderMedal}>{medals[index] || "🌟"}</Text>
        </View>
        <View style={styles.leaderAvatar}>
          <Text style={styles.leaderInitial}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={styles.leaderName} numberOfLines={1}>
          {item.name.split(' ')[0]}
        </Text>
        <View style={styles.leaderScore}>
          <Text style={styles.leaderPoints}>{item.total_reports || 0}</Text>
          <Text style={styles.leaderLabel}>reports</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const ReportCard = ({ item, isLiked, onLike, index }: any) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

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

  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onLike(item.id);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={10} tint="light" style={styles.cardBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
          style={styles.cardGradient}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={["#66eab3", "#4ba24b"]}
              style={styles.avatarSmall}
            >
              <Text style={styles.avatarSmallText}>{item.title.charAt(0)}</Text>
            </LinearGradient>
            <View style={styles.headerInfo}>
              <Text style={styles.reportId}>Report #{item.id}</Text>
              <Text style={styles.dateTime}>Just now</Text>
            </View>
            {item.status === 'resolved' && (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedText}>✓ Solved</Text>
              </View>
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Image */}
          {item.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${BASE_URL}/uploads/${item.image}` }}
                style={styles.image}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)"]}
                style={styles.imageOverlay}
              />
            </View>
          )}

          {/* Admin Notes */}
          {item.status === 'resolved' && item.admin_notes && (
            <BlurView intensity={15} tint="light" style={styles.adminNotesBlur}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.adminNotes}
              >
                <Text style={styles.adminNotesTitle}>🎉 Official Update</Text>
                <Text style={styles.adminNotesText}>
                  {item.admin_notes || "Problem solved!"}
                </Text>
              </LinearGradient>
            </BlurView>
          )}

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.locationContainer}>
              <View style={styles.locationIcon}>
                <Text style={styles.locationEmoji}>📍</Text>
              </View>
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.likeButton,
                  isLiked && styles.likeButtonActive,
                ]}
                onPress={handleLikePress}
              >
                <LinearGradient
                  colors={
                    isLiked
                      ? ["#2E7D32", "#4CAF50"]
                      : ["#F5F5F5", "#E0E0E0"]
                  }
                  style={styles.likeGradient}
                >
                  <Text style={[styles.likeEmoji, isLiked && { color: "#FFF" }]}>
                    {isLiked ? "▲" : "△"}
                  </Text>
                  <Text style={[styles.likeCount, isLiked && { color: "#FFF" }]}>
                    {item.likeCount || 0}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#35a848",
  },
  listContent: {
    paddingBottom: 30,
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
  headerWrapper: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  heroGradient: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroBlur: {
    borderRadius: 24,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "600",
  },
  streakBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    minWidth: 60,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
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
    letterSpacing: 1,
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
  leadersSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  viewAllButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  leadersList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  leaderCard: {
    marginRight: 15,
  },
  leaderGradient: {
    width: 110,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  leaderBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 36,
    height: 36,
    backgroundColor: "#FFF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  leaderMedal: {
    fontSize: 20,
  },
  leaderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  leaderInitial: {
    fontSize: 26,
    fontWeight: "900",
    color: "#667eea",
  },
  leaderName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  leaderScore: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  leaderPoints: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
  },
  leaderLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  feedTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBlur: {
    borderRadius: 24,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarSmallText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
  },
  headerInfo: {
    flex: 1,
  },
  reportId: {
    fontWeight: "800",
    fontSize: 15,
    color: "#1a1a2e",
  },
  dateTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    fontWeight: "500",
  },
  resolvedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  resolvedText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#E0E0E0",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  adminNotesBlur: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  adminNotes: {
    padding: 16,
    borderRadius: 16,
  },
  adminNotesTitle: {
    fontWeight: "800",
    color: "#1B5E20",
    fontSize: 14,
    marginBottom: 6,
  },
  adminNotesText: {
    color: "#2E7D32",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 15,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  locationEmoji: {
    fontSize: 16,
  },
  location: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    flex: 1,
  },
  likeButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  likeButtonActive: {
    shadowColor: "#2E7D32",
    shadowOpacity: 0.3,
  },
  likeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  likeEmoji: {
    color: "#666",
    fontWeight: "900",
    fontSize: 16,
  },
  likeCount: {
    fontWeight: "800",
    color: "#666",
    fontSize: 15,
  },
});;