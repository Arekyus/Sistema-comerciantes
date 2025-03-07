import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  StatusBar, 
  Modal, 
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SaleService from '../services/SaleService';

const CashBookScreen = ({ navigation }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        const sales = await SaleService.getSales();
        setSalesData(sales);
      } catch (error) {
        console.error('Erro ao carregar dados de vendas:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadSalesData();
    });

    return unsubscribe;
  }, [navigation]);

  
  const showSaleDetails = (saleId) => {
    
    navigation.navigate('SalesDetailScreen', { 
      saleId, 
      source: 'CashBook'  
    });
  };

  
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.saleItem}
      onPress={() => showSaleDetails(item.id)}
    >
      <Text style={styles.saleNumber}>{item.number}</Text>
      <Text style={styles.saleClient} numberOfLines={1} ellipsizeMode="tail">
        {item.client || 'Cliente não identificado'}
      </Text>
      <Text style={styles.saleTotal}>
        R$ {parseFloat(item.total).toFixed(2)}
      </Text>
      <View style={[
        styles.paymentMethodBadge,
        item.paymentMethod === 'PIX' && styles.pixBadge,
        item.paymentMethod === 'Cartão' && styles.cardBadge,
        item.paymentMethod === 'Dinheiro' && styles.cashBadge
      ]}>
        <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => showSaleDetails(item.id)}
      >
        <Feather name="eye" size={20} color="#4287f5" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  
  const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="arrow-left" size={24} color="#333" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Livro Caixa</Text>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total em Vendas:</Text>
          <Text style={styles.summaryTotal}>R$ {totalSales.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Vendas Registradas:</Text>
          <Text style={styles.summaryCount}>{salesData.length}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, styles.numberColumn]}>Nº</Text>
        <Text style={[styles.columnHeader, styles.clientColumn]}>Cliente</Text>
        <Text style={[styles.columnHeader, styles.totalColumn]}>Valor</Text>
        <Text style={[styles.columnHeader, styles.methodColumn]}>Pagamento</Text>
        <Text style={[styles.columnHeader, styles.detailColumn]}></Text>
      </View>
      
      <FlatList
        data={salesData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      {/* O modal pode ser removido ou comentado */}
      {/* Modal foi removido pois agora usamos navegação para tela de detalhes */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#42b883',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4287f5',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e9e9e9',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  columnHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
  },
  numberColumn: {
    width: '10%',
  },
  clientColumn: {
    width: '30%',
  },
  totalColumn: {
    width: '20%',
  },
  methodColumn: {
    width: '25%',
  },
  detailColumn: {
    width: '15%',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#fff',
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  saleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saleNumber: {
    width: '10%',
    fontSize: 14,
  },
  saleClient: {
    width: '30%',
    fontSize: 14,
  },
  saleTotal: {
    width: '20%',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodContainer: {
    width: '25%',
  },
  paymentMethod: {
    fontSize: 13,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    color: '#fff',
    backgroundColor: '#999',
  },
  pixPayment: {
    backgroundColor: '#4287f5',
  },
  cardPayment: {
    backgroundColor: '#42b883',
  },
  cashPayment: {
    backgroundColor: '#f5a742',
  },
  detailButton: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailsModalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContent: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: '30%',
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemColumnHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    flex: 2,
    fontSize: 14,
  },
  itemQuantity: {
    flex: 0.5,
    fontSize: 14,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#42b883',
  },
  closeButton: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  noItemsText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  viewDetailsButton: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});

export default CashBookScreen;