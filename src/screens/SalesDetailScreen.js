import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SaleService from '../services/SaleService';  

const SalesDetailScreen = ({ navigation, route }) => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSaleDetails = async () => {
      try {
        const { saleId } = route.params;
        console.log('Carregando venda com ID:', saleId);
        
        if (!saleId) {
          Alert.alert('Erro', 'ID da venda não encontrado');
          navigation.goBack();
          return;
        }
        
        const saleData = await SaleService.getSaleDetails(saleId);
        console.log('Detalhes da venda:', JSON.stringify(saleData));
        console.log('Número de itens:', saleData.items ? saleData.items.length : 0);
        
        if (!saleData) {
          Alert.alert('Erro', 'Detalhes da venda não encontrados');
          navigation.goBack();
          return;
        }
        
        setSale(saleData);
      } catch (error) {
        console.error('Erro ao carregar detalhes da venda:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da venda');
      } finally {
        setLoading(false);
      }
    };
    
    loadSaleDetails();
  }, [route.params?.saleId]);

  
  useEffect(() => {
    const { source } = route.params || {};
    if (source) {
      console.log('Tela de origem:', source);
    }
  }, [route.params]);
  
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Carregando detalhes da venda...</Text>
      </View>
    );
  }
  
  if (!sale) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Venda não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detalhes da Venda #{sale.number}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Informações do cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color="#4287f5" />
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{sale.client}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{sale.phone}</Text>
          </View>
        </View>
        
        {/* Informações da transação */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shopping-bag" size={20} color="#4287f5" />
            <Text style={styles.sectionTitle}>Produtos Adquiridos</Text>
          </View>
          
          {/* Cabeçalho da tabela de produtos */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, styles.productNameHeader]}>Produto</Text>
            <Text style={[styles.columnHeader, styles.quantityHeader]}>Qtd</Text>
            <Text style={[styles.columnHeader, styles.priceHeader]}>Preço</Text>
            <Text style={[styles.columnHeader, styles.totalHeader]}>Total</Text>
          </View>
          
          {/* Lista de produtos - substituir FlatList por mapeamento direto */}
          <View>
            {sale.items && sale.items.length > 0 ? (
              sale.items.map((item, index) => (
                <View key={`item-${item.id || index}`} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name || `Produto ${index + 1}`}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  <Text style={styles.itemPrice}>R$ {Number(item.price || 0).toFixed(2)}</Text>
                  <Text style={styles.itemTotal}>R$ {Number(item.total || 0).toFixed(2)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>Nenhum produto nesta venda</Text>
            )}
          </View>
        </View>
        
        {/* Informações de pagamento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={20} color="#4287f5" />
            <Text style={styles.sectionTitle}>Pagamento</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{sale.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Método:</Text>
            <View style={styles.paymentMethodContainer}>
              <Text style={[
                styles.paymentMethod,
                sale.paymentMethod === 'PIX' && styles.pixPayment,
                sale.paymentMethod === 'Cartão' && styles.cardPayment,
                sale.paymentMethod === 'Dinheiro' && styles.cashPayment
              ]}>
                {sale.paymentMethod}
              </Text>
            </View>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>R$ {sale.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Botão voltar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContent}>
            <Feather name="arrow-left" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4287f5',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    width: '25%',
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  productNameHeader: {
    flex: 2,
  },
  quantityHeader: {
    width: 40,
    textAlign: 'center',
  },
  priceHeader: {
    width: 70,
    textAlign: 'right',
  },
  totalHeader: {
    width: 70,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 2,
    fontSize: 14,
  },
  itemQuantity: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
  },
  itemPrice: {
    width: 70,
    textAlign: 'right',
    fontSize: 14,
  },
  itemTotal: {
    width: 70,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodContainer: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    paddingVertical: 3,
    paddingHorizontal: 10,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    backgroundColor: '#4287f5',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
    marginBottom: 20,
  },
  noItemsText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SalesDetailScreen;