import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProductService from '../services/ProductService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minStockValue, setMinStockValue] = useState(3); // Valor padrão
  const [lowStockModalVisible, setLowStockModalVisible] = useState(false);

  // Carregar produtos do banco de dados
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await ProductService.getAllProducts();
      console.log("Produtos carregados:", productsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  // Executa quando a tela é montada ou quando voltamos para ela
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts();
    });

    return unsubscribe;
  }, [navigation]);

  // Carregar valor mínimo de estoque configurado
  useEffect(() => {
    const loadMinStockValue = async () => {
      try {
        const value = await AsyncStorage.getItem('@minStockValue');
        if(value !== null) {
          setMinStockValue(parseInt(value, 10));
          console.log('Valor mínimo de estoque carregado:', value);
        }
      } catch(e) {
        console.error('Erro ao carregar valor mínimo de estoque:', e);
      }
    };
    
    loadMinStockValue();
  }, []);

  const handleEditProduct = (productId) => {
    navigation.navigate('EditProductScreen', { productId });
  };

  // Função para filtrar produtos com estoque baixo
  const getLowStockProducts = () => {
    return products.filter(product => parseInt(product.quantity) < minStockValue);
  };

  // Modifique o renderItem para incluir o indicador de estoque baixo
  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <Text style={styles.productCode}>{item.code}</Text>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.quantityContainer}>
        <Text style={[
          styles.productQuantity, 
          parseInt(item.quantity) < minStockValue ? styles.lowStockText : null
        ]}>
          {item.quantity}
        </Text>
        {parseInt(item.quantity) < minStockValue && (
          <Feather name="alert-circle" size={16} color="#ff3b30" style={styles.alertIcon} />
        )}
      </View>
      <Text style={styles.productPrice}>R$ {parseFloat(item.price).toFixed(2)}</Text>
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => handleEditProduct(item.id)}
      >
        <Feather name="edit" size={20} color="#4287f5" />
      </TouchableOpacity>
    </View>
  );

  const renderLowStockItem = ({ item }) => (
    <View style={styles.lowStockItem}>
      <View style={styles.lowStockInfo}>
        <Text style={styles.lowStockCode}>{item.code}</Text>
        <Text style={styles.lowStockName}>{item.name}</Text>
      </View>
      <View style={styles.lowStockDetails}>
        <Text style={styles.lowStockQuantity}>{item.quantity}</Text>
        <Text style={styles.lowStockNeeded}>{minStockValue - parseInt(item.quantity)} a repor</Text>
      </View>
    </View>
  );

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
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.lowStockButton}
            onPress={() => setLowStockModalVisible(true)}
          >
            <Feather name="alert-triangle" size={16} color="#ff3b30" />
            <Text style={styles.lowStockButtonText}>Estoque Baixo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProductScreen')}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Produto</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.listHeader}>
        <Text style={styles.columnHeader}>Código</Text>
        <Text style={[styles.columnHeader, styles.nameHeader]}>Nome do Produto</Text>
        <Text style={[styles.columnHeader, styles.quantityHeader]}>Qtd</Text>
        <Text style={styles.columnHeader}>Valor</Text>
        <Text style={styles.columnHeader}></Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4287f5" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={lowStockModalVisible}
        onRequestClose={() => setLowStockModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Produtos com Estoque Baixo
              </Text>
              <TouchableOpacity 
                onPress={() => setLowStockModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Produtos com quantidade abaixo de {minStockValue} unidades
            </Text>
            
            {getLowStockProducts().length > 0 ? (
              <FlatList
                data={getLowStockProducts()}
                renderItem={renderLowStockItem}
                keyExtractor={item => item.id.toString()}
                style={styles.modalList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="check-circle" size={50} color="#42b883" />
                <Text style={styles.emptyModalText}>
                  Parabéns! Nenhum produto com estoque baixo
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setLowStockModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
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
    justifyContent: 'space-between',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcccc',
    marginRight: 8,
  },
  lowStockButtonText: {
    color: '#ff3b30',
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4287f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  listHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#e9e9e9',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  columnHeader: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
  },
  nameHeader: {
    flex: 1,
    marginLeft: 10,
  },
  quantityHeader: {
    width: 50, // Aumentado de 40 para 50 para acomodar o ícone
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  productCode: {
    width: 60,
    fontSize: 14,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  quantityContainer: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQuantity: {
    fontSize: 14,
    textAlign: 'center',
  },
  lowStockText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  alertIcon: {
    marginLeft: 4,
  },
  productPrice: {
    width: 80,
    fontSize: 14,
    textAlign: 'right',
  },
  editButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  modalList: {
    maxHeight: '70%',
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockCode: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  lowStockName: {
    fontSize: 15,
    fontWeight: '500',
  },
  lowStockDetails: {
    alignItems: 'flex-end',
  },
  lowStockQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  lowStockNeeded: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  modalButton: {
    backgroundColor: '#4287f5',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyModalText: {
    fontSize: 16,
    color: '#42b883',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default ProductScreen;