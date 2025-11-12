import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // For mobile

const PrivacyPolicy: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>
      <Text style={styles.paragraph}>
        This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from ProjektOR (the “Site”).
      </Text>
      <Text style={styles.subHeader}>Personal Information We Collect</Text>
      <Text style={styles.paragraph}>
        When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as “Device Information.”
      </Text>
      <Text style={styles.subHeader}>How We Use Your Personal Information</Text>
      <Text style={styles.paragraph}>
        We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
      </Text>
      <Text style={styles.list}>- Communicate with you;</Text>
      <Text style={styles.list}>- Screen our orders for potential risk or fraud; and</Text>
      <Text style={styles.list}>- When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</Text>
      <Text style={styles.paragraph}>
        We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns).
      </Text>
      <Text style={styles.subHeader}>Your Rights</Text>
      <Text style={styles.paragraph}>
        If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
      </Text>
      <Text style={styles.paragraph}>
        Additionally, if you are a European resident we note that we are processing your information in order to fulfill contracts we might have with you (for example if you make an order through the Site), or otherwise to pursue our legitimate business interests listed above. Additionally, please note that your information will be transferred outside of Europe, including to Canada and the United States.
      </Text>
      <Text style={styles.subHeader}>Contact Us</Text>
      <Text style={styles.paragraph}>
        For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at privacy@projektor.com.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  list: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 20,
    marginBottom: 5,
  },
});

export default PrivacyPolicy;
