import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#66ea6d", "#4ba28f", "#b4fb93"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Circles - Keep these outside the ScrollView so they stay fixed */}
        <Animated.View
          style={[
            styles.decorativeCircle1,
            { transform: [{ rotate: spin }, { scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            style={styles.gradientCircle}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.decorativeCircle2,
            { transform: [{ rotate: spin }, { scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(76,175,80,0.2)", "rgba(46,125,50,0.1)"]}
            style={styles.gradientCircle}
          />
        </Animated.View>

        {/* Change the main View to Animated.ScrollView */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={[{ width: '100%' }, { opacity: fadeAnim }]} // Move opacity into the style array
        >
          <Animated.View
            style={[
              styles.content,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Glassmorphic Logo Container */}
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <BlurView intensity={20} tint="light" style={styles.glassContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                  style={styles.logoGradient}
                >
                  <View style={styles.iconContainer}>
                    <Animated.View
                      style={[
                        styles.iconCircle,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <LinearGradient
                        colors={["#2E7D32", "#4CAF50", "#8BC34A"]}
                        style={styles.iconGradient}
                      >
                        <Text style={styles.iconEmoji}>🌍</Text>
                      </LinearGradient>
                    </Animated.View>
                    
                    <Animated.View
                      style={[
                        styles.iconCircleSecondary,
                        { transform: [{ rotate: spin }] },
                      ]}
                    >
                      <LinearGradient
                        colors={["#4CAF50", "#8BC34A"]}
                        style={styles.secondaryIconGradient}
                      >
                        <Text style={styles.iconEmojiSmall}>♻️</Text>
                      </LinearGradient>
                    </Animated.View>
                  </View>

                  <View style={styles.sparklesContainer}>
                    <Text style={styles.sparkle}>✨</Text>
                    <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
                    <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>

            {/* App Name */}
            <View style={styles.titleContainer}>
              <Text style={styles.logo}>Clean</Text>
              <LinearGradient
                colors={["#4CAF50", "#8BC34A", "#CDDC39"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentTextGradient}
              >
                <Text style={styles.logoAccent}>Alert</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>Smart Waste Reporting System</Text>
              <View style={styles.subtitleUnderline} />
            </View>

            <View style={styles.featuresContainer}>
              <FeatureItem icon="📍" text="Real-time location tracking" delay={0} color="#FF6B6B" />
              <FeatureItem icon="📸" text="Photo evidence reporting" delay={100} color="#4ECDC4" />
              <FeatureItem icon="🚀" text="Quick issue resolution" delay={200} color="#FFE66D" />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("./login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2E7D32", "#388E3C", "#4CAF50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Get Started</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              🌱 Join thousands making their community cleaner
            </Text>
          </Animated.View>
        </Animated.ScrollView>
      </LinearGradient>
    </>
  );
}

const FeatureItem = ({ icon, text, delay, color }: { icon: string; text: string; delay: number; color: string }) => {
  const slideInAnim = useRef(new Animated.Value(50)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureItem,
        {
          opacity: fadeInAnim,
          transform: [{ translateX: slideInAnim }],
        },
      ]}
    >
      <BlurView intensity={20} tint="light" style={styles.featureBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]}
          style={styles.featureGradient}
        >
          <View style={[styles.featureIconContainer, { backgroundColor: color + "30" }]}>
            <Text style={styles.featureIcon}>{icon}</Text>
          </View>
          <Text style={styles.featureText}>{text}</Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingVertical: 60, // Gives space at top and bottom so content isn't cramped
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 30,
    width: "100%",
    zIndex: 10,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    right: -100,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -100,
    left: -80,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: height * 0.3,
    left: -50,
  },
  gradientCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  logoContainer: {
    marginBottom: 30,
  },
  glassContainer: {
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoGradient: {
    padding: 30,
    borderRadius: 40,
  },
  iconContainer: {
    position: "relative",
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSecondary: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 27.5,
    bottom: -5,
    right: -5,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryIconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 60,
  },
  iconEmojiSmall: {
    fontSize: 26,
  },
  sparklesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  sparkle: {
    position: "absolute",
    fontSize: 20,
    top: 10,
    right: 10,
  },
  sparkle2: {
    top: 40,
    left: 5,
    fontSize: 16,
  },
  sparkle3: {
    bottom: 20,
    right: 15,
    fontSize: 14,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  accentTextGradient: {
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  logoAccent: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitleContainer: {
    alignItems: "center",
    marginBottom: 45,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    opacity: 0.7,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
    gap: 16,
  },
  featureItem: {
    width: "100%",
  },
  featureBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  featureGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 26,
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  button: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    position: "relative",
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 1,
    marginRight: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: -width,
    width: width,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statsContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  statsGradient: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  footerText: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
