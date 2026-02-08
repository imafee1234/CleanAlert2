import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Animated, Dimensions, StatusBar, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { registerUser } from "../services/api";

const { width, height } = Dimensions.get("window");

export default function Signup() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    // Password strength calculator
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return ["#f44336", "#d32f2f"] as const;
    if (passwordStrength <= 50) return ["#FF9800", "#F57C00"] as const;
    if (passwordStrength <= 75) return ["#2196F3", "#1976D2"] as const;
    return ["#4CAF50", "#2E7D32"] as const;
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleSignup = async () => {
    if (!fullname || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({ fullname, email, password });
      if (res.message) {
        Alert.alert("Success! 🎉", "Account created! Please login.", [
          { text: "Continue", onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Registration failed. Try again.");
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
        {/* Animated Background */}
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
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={["#4CAF50", "#8BC34A"]}
                  style={styles.iconGradient}
                >
                  <Text style={styles.iconText}>🌱</Text>
                </LinearGradient>
              </Animated.View>

              <Text style={styles.title}>Join the Movement</Text>
              <Text style={styles.subtitle}>
                Create your account and start making a difference
              </Text>
            </View>

            {/* Form Card */}
            <BlurView intensity={20} tint="light" style={styles.formBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                style={styles.formCard}
              >
                <Text style={styles.formTitle}>Create Account</Text>

                {/* Full Name Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Text style={styles.labelIcon}>👤</Text>
                    <Text style={styles.labelText}>Full Name</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="John Doe"
                      style={styles.input}
                      value={fullname}
                      onChangeText={setFullname}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

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
                      placeholder="Create a strong password"
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

                  {/* Password Strength */}
                  {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBar}>
                        <LinearGradient
                          colors={getStrengthColor()}
                          style={[styles.strengthFill, { width: `${passwordStrength}%` }]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: getStrengthColor()[0] }]}>
                        {getStrengthLabel()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Terms */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsIcon}>🛡️</Text>
                  <Text style={styles.termsText}>
                    By signing up, you agree to our Terms & Privacy Policy
                  </Text>
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#2E7D32", "#388E3C", "#4CAF50"]}
                    style={styles.signupGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
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
                        <Text style={styles.signupText}>Creating account...</Text>
                      </View>
                    ) : (
                      <View style={styles.signupContent}>
                        <Text style={styles.signupText}>Create Account</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>

            {/* Login Link */}
            <BlurView intensity={15} tint="light" style={styles.loginBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                style={styles.loginContainer}
              >
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
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
    paddingBottom: 40,
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
  heroSection: {
    alignItems: "center",
    marginBottom: 35,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconText: {
    fontSize: 45,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 10,
    letterSpacing: -1.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 30,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    fontSize: 26,
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
  strengthContainer: {
    marginTop: 10,
  },
  strengthBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  termsIcon: {
    fontSize: 18,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    fontWeight: "500",
  },
  signupButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#f5576c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 30,
  },
  signupGradient: {
    padding: 18,
  },
  signupContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  
  signupArrowText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
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
  loginBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 25,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loginText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "800",
    color: "#667eea",
  },
});