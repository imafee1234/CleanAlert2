import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Animated, Dimensions, StatusBar, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { loginUser } from "../services/api";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse
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

    // Continuous rotation for background
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (res.success) {
        Alert.alert("Welcome! 🎉", "Login successful", [
          { text: "Continue", onPress: () => router.replace("/(main)/home") }
        ]);
      } else {
        Alert.alert("Login Failed", res.message || "Invalid credentials");
      }
    } catch (err) {
      console.log("Login Error:", err);
      Alert.alert("Error", "Cannot connect to server. Check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#66ea6d", "#4ba28f", "#b4fb93"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Circles */}
        <Animated.View
          style={[
            styles.bgCircle1,
            { transform: [{ rotate: spin }, { scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            style={styles.circleGradient}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bgCircle2,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(76,175,80,0.2)", "rgba(46,125,50,0.1)"]}
            style={styles.circleGradient}
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={[
              styles.scrollView,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={["#4CAF50", "#8BC34A"]}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoIcon}>🌍</Text>
                </LinearGradient>
              </Animated.View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>Clean</Text>
                <LinearGradient
                  colors={["#4CAF50", "#8BC34A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.accentGradient}
                >
                  <Text style={styles.titleAccent}>Alert</Text>
                </LinearGradient>
              </View>

              <Text style={styles.subtitle}>Welcome back, Hero! 👋</Text>
            </View>

            {/* Form Card */}
            <BlurView intensity={20} tint="light" style={styles.formBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                style={styles.formCard}
              >
                <Text style={styles.formTitle}>Sign in to continue</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Text style={styles.labelIcon}>📧</Text>
                    <Text style={styles.labelText}>Email Address</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="your.email@example.com"
                      style={styles.input}
                      value={email}
                      onChangeText={(text) => setEmail(text.trim().toLowerCase())}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Text style={styles.labelIcon}>🔒</Text>
                    <Text style={styles.labelText}>Password</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#2E7D32", "#388E3C", "#4CAF50"]}
                    style={styles.loginGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View
                          style={[
                            styles.loadingSpinner,
                            {
                              transform: [{
                                rotate: pulseAnim.interpolate({
                                  inputRange: [1, 1.1],
                                  outputRange: ['0deg', '360deg'],
                                }),
                              }],
                            },
                          ]}
                        >
                          <Text style={styles.loadingIcon}>⟳</Text>
                        </Animated.View>
                        <Text style={styles.loginText}>Signing in...</Text>
                      </View>
                    ) : (
                      <View style={styles.loginContent}>
                        <Text style={styles.loginText}>Sign In</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>

            {/* Sign Up Link */}
            <BlurView intensity={15} tint="light" style={styles.signupBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                style={styles.signupContainer}
              >
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🌱 Join 10,000+ environmental heroes
              </Text>
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  bgCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    right: -100,
  },
  bgCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -100,
    left: -80,
  },
  circleGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoIcon: {
    fontSize: 50,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  accentGradient: {
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  titleAccent: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formBlur: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 20,
  },
  formCard: {
    padding: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  labelIcon: {
    fontSize: 18,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#1a1a2e",
    fontWeight: "500",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 0,
    padding: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  loginButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 30,
  },
  loginGradient: {
    padding: 18,
  },
  loginContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    marginRight: 12,
  },
  loadingIcon: {
    fontSize: 24,
    color: "#FFF",
  },
  signupBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  signupText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  signupLink: {
    fontSize: 15,
    fontWeight: "800",
    color: "#667eea",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});