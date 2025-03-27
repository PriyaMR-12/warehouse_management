import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
  },
  description: {
    width: '70%',
  },
  quantity: {
    width: '15%',
    textAlign: 'right',
  },
  location: {
    width: '15%',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

const PackingSlip = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PACKING SLIP</Text>
        <Text>Order #: {order.orderNumber}</Text>
        <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
          Ship To:
        </Text>
        <Text>{order.customer.name}</Text>
        <Text>{order.shippingAddress.street}</Text>
        <Text>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
        </Text>
        <Text>{order.customer.phone}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.description}>Item Description</Text>
          <Text style={styles.quantity}>Quantity</Text>
          <Text style={styles.location}>Location</Text>
        </View>

        {order.items.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.description}>{item.product.name}</Text>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <Text style={styles.location}>{item.product.location}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 12, marginTop: 20 }}>
          Special Instructions:
        </Text>
        <Text style={{ fontSize: 10 }}>
          {order.specialInstructions || 'None'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Internal Use Only - Not for Customer</Text>
      </View>
    </Page>
  </Document>
);

export default PackingSlip; 