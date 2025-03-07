import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProductService from '../services/ProductService';
import SaleService from '../services/SaleService';

const SalesScreen = ({ navigation }) => {
  // Estados para gerenciar a venda
  const [saleNumber, setSaleNumber] = useState('0001');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para os modais
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  
  // Estados para adicionar produtos
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  
  // Produtos cadastrados no sistema (exemplo)
  const [products, setProducts] = useState([
    { id: '1', code: 'P001', name: 'Camiseta Básica', quantity: 25, price: 29.90 },
    { id: '2', code: 'P002', name: 'Calça Jeans', quantity: 15, price: 89.90 },
    { id: '3', code: 'P003', name: 'Tênis Esportivo', quantity: 10, price: 159.90 },
    { id: '4', code: 'P004', name: 'Meias (par)', quantity: 50, price: 12.50 },
    { id: '5', code: 'P005', name: 'Boné', quantity: 20, price: 24.90 },
  ]);
  
  // Produtos filtrados pela busca
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Carregar o próximo número de venda ao iniciar
  useEffect(() => {
    const loadSaleNumber = async () => {
      try {
        const nextNumber = await SaleService.getNextSaleNumber();
        setSaleNumber(nextNumber);
      } catch (error) {
        console.error('Erro ao obter número da venda:', error);
      }
    };

    const loadProducts = async () => {
      try {
        const productsData = await ProductService.getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    };

    loadSaleNumber();
    loadProducts();
  }, []);

  // Função para cancelar a venda
  const handleCancelSale = () => {
    setCancelModalVisible(false);
    navigation.navigate('Home');
  };
  
  // Função para selecionar um produto e abrir modal de quantidade
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductsModalVisible(false);
    setQuantityModalVisible(true);
    setQuantity('1');
  };
  
  // Função para adicionar produto à venda
  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    const qtyNumber = parseInt(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return;
    }
    
    // Verificar se o produto já está na venda
    const existingProductIndex = saleItems.findIndex(item => item.id === selectedProduct.id);
    
    if (existingProductIndex >= 0) {
      // Atualizar quantidade se o produto já existir na venda
      const updatedItems = [...saleItems];
      updatedItems[existingProductIndex].saleQuantity += qtyNumber;
      updatedItems[existingProductIndex].total = 
        updatedItems[existingProductIndex].saleQuantity * updatedItems[existingProductIndex].price;
      setSaleItems(updatedItems);
    } else {
      // Adicionar novo item à venda
      const newItem = {
        ...selectedProduct,
        saleQuantity: qtyNumber,
        total: qtyNumber * selectedProduct.price
      };
      setSaleItems([...saleItems, newItem]);
    }
    
    setQuantityModalVisible(false);
    setSelectedProduct(null);
  };
  
  // Função para editar quantidade de um item
  const handleEditQuantity = (itemId) => {
    const item = saleItems.find(i => i.id === itemId);
    if (item) {
      setSelectedProduct(item);
      setQuantity(item.saleQuantity.toString());
      setQuantityModalVisible(true);
    }
  };
  
  // Função para remover item da venda
  const handleRemoveItem = (itemId) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };
  
  // Calcular total da venda
  const saleTotal = saleItems.reduce((sum, item) => sum + item.total, 0);
  
  // Função para processar o pagamento
  const handleFinishSale = async (method) => {
    console.log('Iniciando finalização de venda...');
    setLoading(true);
    setPaymentMethod(method);
    setPaymentModalVisible(false);
    
    try {
      console.log(`Finalizando venda com método: ${method}, itens: ${saleItems.length}`);
      
      // Verificar se há itens na venda
      if (saleItems.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos um produto à venda');
        setLoading(false);
        return;
      }
  
      const saleData = {
        number: saleNumber,
        client: buyerName || 'Cliente não identificado',
        phone: buyerPhone || '',
        total: saleTotal,
        paymentMethod: method,
        items: saleItems
      };
      
      console.log("Enviando dados para salvar venda:", JSON.stringify(saleData));
      
      // Salvar a venda no banco de dados
      const result = await SaleService.createSale(saleData);
      
      console.log("Venda finalizada com sucesso, resultado:", result);
      
      // Limpar os dados da venda atual
      try {
        const nextNumber = await SaleService.getNextSaleNumber();
        setSaleNumber(nextNumber);
      } catch (numberError) {
        console.error("Erro ao obter próximo número:", numberError);
        // Não falha a operação por causa disso
      }
      
      setBuyerName('');
      setBuyerPhone('');
      setSaleItems([]);
      
      // Exibir alerta de sucesso (pequeno delay para UI)
      setTimeout(() => {
        Alert.alert(
          'Venda Finalizada', 
          `Venda #${result.number} finalizada com sucesso!\nForma de pagamento: ${method}`,
          [
            { 
              text: 'Ver Detalhes', 
              onPress: () => {
                console.log('Navegando para detalhes, ID:', result.id);
                navigation.navigate('SalesDetailScreen', { 
                  saleId: result.id,
                  source: 'SalesScreen'
                });
              } 
            },
            {
              text: 'Nova Venda',
              onPress: () => {} // Permanece na tela atual
            }
          ]
        );
      }, 300);
      
    } catch (error) {
      console.error('Erro detalhado:', error.message, error.stack);
      Alert.alert(
        'Erro', 
        'Não foi possível finalizar a venda. Verifique o log para mais detalhes.'
      );
    } finally {
      // Sempre garantimos que o loading é desativado
      setLoading(false);
    }
  };

  // Adicione uma função para visualizar detalhes após finalizar a venda
  const handleViewDetails = (saleId) => {
    navigation.navigate('SalesDetailScreen', { saleId });
  };
  
  // Renderizar item da lista de produtos cadastrados
  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productCode}>{item.code}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addIconButton} 
        onPress={() => handleSelectProduct(item)}
      >
        <Feather name="plus-circle" size={24} color="#42b883" />
      </TouchableOpacity>
    </View>
  );
  
  // Renderizar item da venda
  const renderSaleItem = ({ item }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleItemInfo}>
        <Text style={styles.saleItemName}>{item.name}</Text>
        <Text style={styles.saleItemQty}>{item.saleQuantity} x</Text>
        <Text style={styles.saleItemPrice}>R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.saleItemTotal}>R$ {item.total.toFixed(2)}</Text>
      </View>
      <View style={styles.saleItemActions}>
        <TouchableOpacity 
          style={styles.actionIcon} 
          onPress={() => handleEditQuantity(item.id)}
        >
          <Feather name="edit-2" size={20} color="#4287f5" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionIcon} 
          onPress={() => handleRemoveItem(item.id)}
        >
          <Feather name="trash-2" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      {/* Cabeçalho com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCancelModalVisible(true)}
        >
          <Feather name="arrow-left" size={24} color="#333" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Venda</Text>
      </View>
      
      {/* Informações da venda */}
      <View style={styles.saleInfoContainer}>
        <View style={styles.saleNumberContainer}>
          <Text style={styles.saleNumberLabel}>Venda Nº:</Text>
          <Text style={styles.saleNumberValue}>{saleNumber}</Text>
        </View>
        
        <View style={styles.buyerInfoContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Comprador</Text>
            <TextInput
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Digite o nome do comprador"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
      
      {/* Lista de produtos da venda */}
      <View style={styles.saleItemsContainer}>
        <View style={styles.saleItemsHeader}>
          <Text style={styles.saleItemsTitle}>Produtos da Venda</Text>
          <TouchableOpacity 
            style={styles.addProductButton}
            onPress={() => setProductsModalVisible(true)}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.addProductButtonText}>Adicionar Produtos</Text>
          </TouchableOpacity>
        </View>
        
        {saleItems.length > 0 ? (
          <FlatList
            data={saleItems}
            renderItem={renderSaleItem}
            keyExtractor={item => item.id}
            style={styles.saleList}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Nenhum produto adicionado à venda
            </Text>
          </View>
        )}
      </View>
      
      {/* Total da venda */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>R$ {saleTotal.toFixed(2)}</Text>
      </View>
      
      {/* Botão de finalizar venda */}
      <TouchableOpacity 
        style={[styles.finishButton, loading && styles.disabledButton]}
        disabled={loading || saleItems.length === 0}
        onPress={() => {
          if (saleItems.length === 0) {
            Alert.alert('Erro', 'Adicione pelo menos um produto à venda');
            return;
          }
          setPaymentModalVisible(true);
        }}
      >
        <Text style={styles.finishButtonText}>
          {loading ? 'Processando...' : 'Finalizar Venda'}
        </Text>
      </TouchableOpacity>
      
      {/* Modal para cancelar venda */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirmação</Text>
            <Text style={styles.modalText}>Deseja cancelar a venda?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCancelSale}
              >
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal de produtos cadastrados */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productsModalVisible}
        onRequestClose={() => setProductsModalVisible(false)}
      >
        <View style={styles.productModalContainer}>
          <View style={styles.productModalContent}>
            <View style={styles.productModalHeader}>
              <Text style={styles.productModalTitle}>Selecionar Produto</Text>
              <TouchableOpacity
                onPress={() => setProductsModalVisible(false)}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar produto..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              style={styles.productList}
            />
          </View>
        </View>
      </Modal>
      
      {/* Modal para informar quantidade */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={quantityModalVisible}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Quantidade</Text>
            {selectedProduct && (
              <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
            )}
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddProduct}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal para selecionar forma de pagamento */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Forma de Pagamento</Text>
            <Text style={styles.modalText}>Selecione a forma de pagamento:</Text>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleFinishSale('PIX')}
              >
                <Feather name="smartphone" size={24} color="#4287f5" />
                <Text style={styles.paymentOptionText}>PIX</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleFinishSale('Cartão')}
              >
                <Feather name="credit-card" size={24} color="#42b883" />
                <Text style={styles.paymentOptionText}>Cartão</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleFinishSale('Dinheiro')}
              >
                <Feather name="dollar-sign" size={24} color="#f5a742" />
                <Text style={styles.paymentOptionText}>Dinheiro</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, {marginTop: 15}]}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={{...styles.modalButtonText, color: '#fff'}}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  saleInfoContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  saleNumberContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  saleNumberLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saleNumberValue: {
    fontSize: 16,
    marginLeft: 5,
    color: '#4287f5',
    fontWeight: 'bold',
  },
  buyerInfoContainer: {
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  saleItemsContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saleItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  saleItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4287f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addProductButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  saleList: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  saleItemQty: {
    fontSize: 13,
    color: '#555',
  },
  saleItemPrice: {
    fontSize: 13,
    color: '#555',
  },
  saleItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 3,
  },
  saleItemActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    padding: 8,
  },
  totalContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#42b883',
  },
  finishButton: {
    backgroundColor: '#42b883',
    paddingVertical: 15,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para o modal de cancelamento e quantidade
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedProductName: {
    fontSize: 16,
    marginBottom: 15,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '50%',
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#4287f5',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Estilos para o modal de produtos
  productModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  productModalContent: {
    backgroundColor: '#fff',
    height: '80%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 15,
  },
  productModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    marginHorizontal: 15,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  productList: {
    paddingHorizontal: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productCode: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 3,
  },
  addIconButton: {
    padding: 8,
  },
  // Estilos para o modal de pagamento
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  paymentOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  paymentOptionText: {
    marginTop: 8,
    fontWeight: '500',
    color: '#333',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});

export default SalesScreen;