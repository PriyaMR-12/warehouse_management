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
    width: '60%',
  },
  amount: {
    width: '15%',
    textAlign: 'right',
  },
  total: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
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

const Invoice = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text>Order #: {order.orderNumber}</Text>
        <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
          Bill To:
        </Text>
        <Text>{order.customer.name}</Text>
        <Text>{order.customer.email}</Text>
        <Text>{order.shippingAddress.street}</Text>
        <Text>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.description}>Description</Text>
          <Text style={styles.amount}>Quantity</Text>
          <Text style={styles.amount}>Price</Text>
          <Text style={styles.amount}>Total</Text>
        </View>

        {order.items.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.description}>{item.product.name}</Text>
            <Text style={styles.amount}>{item.quantity}</Text>
            <Text style={styles.amount}>${item.price.toFixed(2)}</Text>
            <Text style={styles.amount}>
              ${(item.quantity * item.price).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.total}>
          <Text>Subtotal: ${order.subtotal.toFixed(2)}</Text>
          <Text>Tax: ${order.tax.toFixed(2)}</Text>
          <Text>Shipping: ${order.shippingCost.toFixed(2)}</Text>
          <Text style={{ marginTop: 10 }}>
            Total: ${order.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

export default Invoice; 