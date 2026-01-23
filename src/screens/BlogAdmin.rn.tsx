/**
 * React Native BlogAdmin Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Admin interface for creating blog posts
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const SECRET_ID = "BlogPost";

const categories = [
  "Technology",
  "Design",
  "Business",
  "Lifestyle",
  "Tutorial",
  "News",
  "AI & Machine Learning",
  "Data Science",
  "Programming",
  "Product",
  "Startups",
  "Marketing",
  "Remote Work",
  "Education",
  "Health",
  "Finance",
  "Case Study",
  "Interview",
  "Opinion",
  "Guides",
  "Announcements",
];

const BlogAdmin: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [idInput, setIdInput] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [imageFile, setImageFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readTime, setReadTime] = useState("1 min read");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await AsyncStorage.getItem("blogAdminAccess");
        setHasAccess(access === "true");
      } catch (error) {
        console.error("Error checking access:", error);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setReadTime(`${Math.max(1, Math.ceil(words / 200))} min read`);
  }, [content]);

  const handleVerify = async () => {
    if (idInput === SECRET_ID) {
      setHasAccess(true);
      await AsyncStorage.setItem("blogAdminAccess", "true");
      await AsyncStorage.setItem("adminCode", idInput);
      setError("");
    } else {
      setError("Invalid ID");
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageFile(asset);
        setImagePreview(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const submit = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill in title and content");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!apiService.isAuthenticated()) {
        setError("Please log in to publish a blog post");
        navigation.navigate("Signup" as never);
        return;
      }

      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const res = await apiService.uploadBlogImage(imageFile);
        imageUrl = res.fileUrl;
      }

      await apiService.createBlog({
        title,
        content,
        category,
        readTime,
        imageUrl,
      });

      setSuccess("Published successfully");
      setTitle("");
      setContent("");
      setCategory("Technology");
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => navigation.navigate("Blog" as never), 800);
    } catch (err: any) {
      setError(err?.message || "Failed to publish");
      Alert.alert("Error", err?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    headerButtonPurple: {
      backgroundColor: "#a855f7",
    },
    headerButtonCyan: {
      backgroundColor: "#06b6d4",
    },
    headerButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    verifyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    verifyTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 24,
    },
    verifyInput: {
      width: "100%",
      height: 50,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      marginBottom: 16,
    },
    verifyButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      alignItems: "center",
    },
    verifyButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
      marginBottom: 8,
    },
    input: {
      height: 50,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    textArea: {
      minHeight: 200,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      textAlignVertical: "top",
    },
    categoryButton: {
      height: 50,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    categoryButtonText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginTop: 12,
    },
    imageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      alignSelf: "flex-start",
    },
    imageButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
    },
    readTimeText: {
      fontSize: 12,
      color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
      marginTop: 8,
    },
    submitButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    errorText: {
      fontSize: 14,
      color: "#ef4444",
      marginTop: 8,
    },
    successText: {
      fontSize: 14,
      color: "#10b981",
      marginTop: 8,
    },
    pickerModal: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    pickerContent: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "50%",
    },
    pickerItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    pickerItemText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
  });

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyTitle}>Blog Admin</Text>
          <TextInput
            style={styles.verifyInput}
            placeholder="Enter Admin Blog ID"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={idInput}
            onChangeText={setIdInput}
            secureTextEntry
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>Enter Admin Blog</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blog Admin</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonPurple]}
            onPress={() => navigation.navigate("Blog" as never, { manage: true } as never)}
          >
            <Text style={styles.headerButtonText}>Manage Blogs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonCyan]}
            onPress={() => navigation.navigate("Blog" as never)}
          >
            <Text style={styles.headerButtonText}>View Blog</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={styles.categoryButtonText}>{category}</Text>
            <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Featured Image</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
            <Ionicons name="image" size={16} color="#ffffff" />
            <Text style={styles.imageButtonText}>Choose Image</Text>
          </TouchableOpacity>
          {imagePreview && (
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} resizeMode="cover" />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your content..."
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={12}
          />
          <Text style={styles.readTimeText}>{readTime}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && <Text style={styles.successText}>{success}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Publish Blog Post</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <Modal
          visible={showCategoryPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContent}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "700", color: darkMode ? "#ffffff" : "#000000" }}>
                  Select Category
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default BlogAdmin;
