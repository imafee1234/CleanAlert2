import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated, StatusBar
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { createReport } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icon
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
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions?.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow location to report accurately.");
      return;
    }

    try {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(`${loc.coords.latitude},${loc.coords.longitude}`);
    } catch (error) {
      Alert.alert("Location Error", "Could not get location. Make sure GPS is on.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id) {
        Alert.alert("Error", "Session expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const data = await createReport({
        title,
        description,
        location,
        image,
        userId: user.id,
      });

      if (data.success !== false) {
        Alert.alert("Success", "Report submitted successfully! 🎉");
        setTitle("");
        setDescription("");
        setImage(null);
        setLocation("");
      }
    } catch (err) {
      Alert.alert("Error", "Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.wrapper}
      >
        <LinearGradient
          colors={["#7cb974", "#31ce58"]}
          style={styles.gradientBackground}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Hero Header */}
              <View style={styles.header}>
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
                <Text style={styles.title}>Report an Issue</Text>
                <Text style={styles.subtitle}>
                  Help us keep your environment clean and safe
                </Text>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <StepIndicator step={1} label="Details" active={!!title} />
                <View style={styles.progressLine} />
                <StepIndicator step={2} label="Photo" active={!!image} />
                <View style={styles.progressLine} />
                <StepIndicator step={3} label="Location" active={!!location} />
              </View>

              {/* Form Card */}
              <BlurView intensity={20} tint="light" style={styles.formBlur}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                  style={styles.formCard}
                >
                  {/* Title Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelIcon}>📝</Text>
                      <Text style={styles.label}>Title</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="e.g., Illegal dumping on Main Street"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholderTextColor="#9E9E9E"
                      />
                    </View>
                  </View>

                  {/* Description Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelIcon}>💬</Text>
                      <Text style={styles.label}>Description</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder="Provide detailed information about the issue..."
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        placeholderTextColor="#9E9E9E"
                      />
                    </View>
                  </View>

                  {/* Image Section */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelIcon}>📷</Text>
                      <Text style={styles.label}>Photo Evidence</Text>
                      {image && (
                        <View style={styles.successBadge}>
                          <Text style={styles.successText}>✓</Text>
                        </View>
                      )}
                    </View>
                    {image ? (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.image} />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.6)"]}
                          style={styles.imageOverlay}
                        >
                          <TouchableOpacity
                            style={styles.changeImageButton}
                            onPress={pickImage}
                          >
                            <Text style={styles.changeImageText}>
                              🔄 Change Photo
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickImage}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={["#F1F8F4", "#E8F5E9"]}
                          style={styles.uploadGradient}
                        >
                          <View style={styles.uploadIconContainer}>
                            <Text style={styles.uploadIcon}>📷</Text>
                          </View>
                          <Text style={styles.uploadText}>Tap to upload photo</Text>
                          <Text style={styles.uploadSubtext}>
                            Photos help us resolve issues faster
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Location Section */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelIcon}>📍</Text>
                      <Text style={styles.label}>Location</Text>
                      {location && (
                        <View style={styles.successBadge}>
                          <Text style={styles.successText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.locationButton,
                        location && styles.locationButtonActive,
                      ]}
                      onPress={getLocation}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          location
                            ? ["#E8F5E9", "#C8E6C9"]
                            : ["#FAFAFA", "#F5F5F5"]
                        }
                        style={styles.locationGradient}
                      >
                        <View style={styles.locationIconContainer}>
                          <Text style={styles.locationIcon}>📍</Text>
                        </View>
                        <View style={styles.locationTextContainer}>
                          <Text
                            style={[
                              styles.locationText,
                              location && styles.locationTextActive,
                            ]}
                          >
                            {location ? "Location captured" : "Get current location"}
                          </Text>
                          {location && (
                            <Text style={styles.locationCoords}>{location}</Text>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#2E7D32", "#37853b", "#4CAF50"]}
                  style={styles.submitGradient}
                >
                  {isSubmitting ? (
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
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <View style={styles.submitContent}>
                      <Text style={styles.submitButtonText}>Submit Report</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer */}
              <BlurView intensity={15} tint="light" style={styles.footer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                  style={styles.footerGradient}
                >
                  <Text style={styles.footerIcon}>⏱️</Text>
                  <Text style={styles.footerText}>
                    Your report will be reviewed within 24-48 hours
                  </Text>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}

const StepIndicator = ({ step, label, active }: any) => (
  <View style={styles.stepContainer}>
    <View style={[styles.stepCircle, active && styles.stepCircleActive]}>
      {active ? (
        <Text style={styles.stepCheckmark}>✓</Text>
      ) : (
        <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>
          {step}
        </Text>
      )}
    </View>
    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 30,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCircleActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#FFF",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  stepNumberActive: {
    color: "#FFF",
  },
  stepCheckmark: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "900",
  },
  stepLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#FFF",
    fontWeight: "700",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 8,
  },
  formBlur: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  labelIcon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    flex: 1,
  },
  successBadge: {
    backgroundColor: "#4CAF50",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#1a1a2e",
    fontWeight: "500",
  },
  textArea: {
    height: 130,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  uploadButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderStyle: "dashed",
  },
  uploadGradient: {
    padding: 35,
    alignItems: "center",
  },
  uploadIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadIcon: {
    fontSize: 36,
  },
  uploadText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 6,
  },
  uploadSubtext: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 240,
    backgroundColor: "#E0E0E0",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: "flex-end",
  },
  changeImageButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  changeImageText: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 14,
  },
  locationButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonActive: {
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
  },
  locationGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIcon: {
    fontSize: 26,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  locationTextActive: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  locationCoords: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  submitButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  submitGradient: {
    padding: 20,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  submitArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  submitArrowText: {
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
  footer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  footerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  footerIcon: {
    fontSize: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
});