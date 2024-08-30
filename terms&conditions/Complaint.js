import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";

const Complaint = () => {
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const handleEmojiPress = (emoji) => {
    setSelectedEmoji(emoji);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        paddingLeft: 20,
      }}
    >
      <View style={styles.feedback}></View>
      <Text style={styles.feedbackText}>Give feedback</Text>
      <Text style={styles.feedbackText1}>
        What do you think of the editing tool?
      </Text>

      <View style={styles.emojiContainer}>
        {["😠", "😟", "😐", "😊"].map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.emojiItem,
              selectedEmoji === emoji && styles.selectedEmojiItem,
            ]}
            onPress={() => handleEmojiPress(emoji)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.emojiLabel}>
              {emoji === "😠"
                ? "Worst"
                : emoji === "😟"
                ? "Sad"
                : emoji === "😐"
                ? "Good"
                : "Better"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={styles.feedbackText1}>
          Do you have any thoughts you'd like to share?
        </Text>
        <TextInput
          placeholder="Enter your complaints"
          style={styles.textInput}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
          marginTop: 40,
        }}
      >
        <TouchableOpacity
          style={{
            width: 110,
            backgroundColor: "maroon",
            height: 50,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 19, fontWeight: "bold" }}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 110,
            height: 50,
            borderColor: "maroon",
            borderWidth: 1,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "black", fontSize: 19, fontWeight: "500" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Complaint;

const styles = StyleSheet.create({
  feedbackText: {
    color: "black",
    fontWeight: "700",
    fontSize: 19,
    marginTop: 10,
  },
  feedbackText1: {
    color: "black",
    fontSize: 15,
    marginTop: 10,
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  emojiItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  selectedEmojiItem: {
    backgroundColor: "rgba(128, 0, 0, 0.2)", // Light maroon color
  },
  emoji: {
    fontSize: 28,
  },
  emojiLabel: {
    marginTop: 5,
    fontSize: 14,
    color: "black",
  },
  textInput: {
    borderColor: "maroon",
    borderWidth: 1,
    width: "95%",
    height: 200,
    marginTop: 15,
    borderRadius: 5,
    padding: 10,
    fontSize: 17,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 40,
  },
  sendButton: {
    width: 110,
    backgroundColor: "maroon",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    width: 110,
    height: 50,  
    borderColor: "maroon",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
  },
});
