import React from 'react';
import { StyleSheet, View } from 'react-native';

const ChatbotBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fa',
  },
});

export default ChatbotBackground; 