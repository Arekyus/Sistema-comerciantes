import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProductService from '../services/ProductService';

const EditProductScreen = ({ navigation, route }) => {
  // Estados para armazenar os dados do produto
  const [productData, setProductData] = useState({
    code: '',
    name: '',
    price: '',
    costPrice: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Extrair o ID do produto dos parâmetros da rota
  const { productId } = route.params || {};

  // Carregar os dados do produto ao montar o componente
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        Alert.alert('Erro', 'ID do produto não fornecido');
        navigation.goBack();
        return;
      }

      try {
        console.log('Carregando produto com ID:', productId);
        setLoading(true);
        
        const product = await ProductService.getProductById(productId);
        
        console.log('Produto carregado:', product);
        
        if (!product) {
          Alert.alert('Erro', 'Produto não encontrado');
          navigation.goBack();
          return;
        }

        // Formatando os valores para exibição nos inputs
        setProductData({
          code: product.code || '',
          name: product.name || '',
          price: product.price ? product.price.toString() : '0',
          costPrice: product.costPrice ? product.costPrice.toString() : '0',
          quantity: product.quantity ? product.quantity.toString() : '0',
        });
      } catch (error) {
        console.error('Erro ao carregar dados do produto:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do produto');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productId, navigation]);

  // Função para atualizar cada campo
  const handleChange = (field, value) => {
    setProductData({ ...productData, [field]: value });
  };

  // Função para salvar as alterações
  const handleSave = async () => {
    // Validação básica
    if (!productData.code || !productData.name || !productData.price) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios: código, nome e preço');
      return;
    }

    try {
      setSaving(true);
      
      const updatedProduct = {
        id: productId,
        code: productData.code,
        name: productData.name,
        price: parseFloat(productData.price),
        costPrice: productData.costPrice ? parseFloat(productData.costPrice) : 0,
        quantity: productData.quantity ? parseInt(productData.quantity) : 0,
      };

      await ProductService.updateProduct(updatedProduct);
      
      Alert.alert(
        'Sucesso', 
        'Produto atualizado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('ProductScreen') }]
      );
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      {/* Cabeçalho com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('ProductScreen')}
        >
          <Feather name="arrow-left" size={24} color="#333" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Produto</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4287f5" />
          <Text style={styles.loadingText}>Carregando dados do produto...</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.formContainer}>
            {/* Campo: Código */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código *</Text>
              <TextInput
                style={styles.input}
                value={productData.code}
                onChangeText={(value) => handleChange('code', value)}
                placeholder="Digite o código do produto"
              />
            </View>
            
            {/* Campo: Nome do Produto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Produto *</Text>
              <TextInput
                style={styles.input}
                value={productData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Digite o nome do produto"
              />
            </View>
            
            {/* Campo: Preço de Venda */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço de Venda *</Text>
              <TextInput
                style={styles.input}
                value={productData.price}
                onChangeText={(value) => handleChange('price', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            
            {/* Campo: Preço de Custo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço de Custo</Text>
              <TextInput
                style={styles.input}
                value={productData.costPrice}
                onChangeText={(value) => handleChange('costPrice', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            
            {/* Campo: Quantidade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.input}
                value={productData.quantity}
                onChangeText={(value) => handleChange('quantity', value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          
          {/* Botão de salvar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4287f5',
  },
  disabledButton: {
    backgroundColor: '#a0c0f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default EditProductScreen;