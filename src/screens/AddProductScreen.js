import React, { useState } from 'react';
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
import ProductService from '../services/ProductService'; // Importar o serviço

const AddProductScreen = ({ navigation }) => {
  // Estado para os campos do novo produto
  const [productData, setProductData] = useState({
    code: '',
    name: '',
    salePrice: '',
    costPrice: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false); // Estado para controlar carregamento

  // Função para atualizar cada campo
  const handleChange = (field, value) => {
    setProductData({ ...productData, [field]: value });
  };

  // Função para salvar o novo produto
  const handleSave = async () => {
    // Validação básica
    if (!productData.code || !productData.name || !productData.salePrice) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios: código, nome e preço de venda.');
      return;
    }

    // Validar valores numéricos
    if (isNaN(parseFloat(productData.salePrice))) {
      Alert.alert('Erro', 'Preço de venda deve ser um número válido.');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar os dados no formato esperado pelo banco
      const productToSave = {
        code: productData.code,
        name: productData.name,
        price: parseFloat(productData.salePrice), // Renomear salePrice para price (conforme esperado pelo banco)
        costPrice: productData.costPrice ? parseFloat(productData.costPrice) : 0,
        quantity: productData.quantity ? parseInt(productData.quantity) : 0,
      };

      // Salvar no banco de dados
      const insertId = await ProductService.addProduct(productToSave);
      
      console.log('Produto salvo com ID:', insertId);
      Alert.alert(
        'Sucesso', 
        'Produto adicionado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('ProductScreen') }]
      );
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Adicionar Produto</Text>
      </View>
      
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
            value={productData.salePrice}
            onChangeText={(value) => handleChange('salePrice', value)}
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
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#42b883',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AddProductScreen;