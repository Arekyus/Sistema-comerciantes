import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import db from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [stockConfigModalVisible, setStockConfigModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [minStockValue, setMinStockValue] = useState('3'); 
  
  
  useEffect(() => {
    const loadMinStockValue = async () => {
      try {
        const value = await AsyncStorage.getItem('@minStockValue');
        if(value !== null) {
          setMinStockValue(value);
          console.log('Valor de estoque mínimo carregado:', value);
        }
      } catch(e) {
        console.error('Erro ao carregar valor de estoque mínimo:', e);
      }
    };
    
    loadMinStockValue();
  }, []);

  
  const clearDatabase = () => {
    db.transaction(tx => {
      
      tx.executeSql('DELETE FROM sale_items', [], () => {
        console.log('Itens de venda apagados');
        
        tx.executeSql('DELETE FROM sales', [], () => {
          console.log('Vendas apagadas');
          
          tx.executeSql('DELETE FROM products', [], () => {
            console.log('Produtos apagados');
            Alert.alert('Sucesso', 'Banco de dados limpo com sucesso!');
          }, (_, error) => console.error('Erro ao limpar produtos:', error));
        }, (_, error) => console.error('Erro ao limpar vendas:', error));
      }, (_, error) => console.error('Erro ao limpar itens de venda:', error));
    });
  };

  
  const handlePasswordConfirm = () => {
    if (password === 'admin') { 
      setPasswordModalVisible(false);
      setConfigModalVisible(false);
      setPassword('');
      clearDatabase();
    } else {
      Alert.alert('Erro', 'Senha incorreta!');
    }
  };
  
 
  const handleSaveMinStock = async () => {
    try {
      
      const numValue = parseInt(minStockValue);
      if (isNaN(numValue) || numValue < 0) {
        Alert.alert('Erro', 'Por favor, insira um valor numérico válido maior ou igual a zero.');
        return;
      }
      
      
      await AsyncStorage.setItem('@minStockValue', minStockValue);
      console.log('Valor mínimo de estoque salvo:', minStockValue);
      
      
      setStockConfigModalVisible(false);
      Alert.alert('Sucesso', `Configuração salva! Alertas serão mostrados quando o estoque for menor que ${minStockValue}.`);
    } catch (e) {
      console.error('Erro ao salvar valor mínimo de estoque:', e);
      Alert.alert('Erro', 'Não foi possível salvar a configuração');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Sistema Comerciantes</Text>
        
        {/* Ícone de configurações */}
        <TouchableOpacity 
          style={styles.configButton}
          onPress={() => setConfigModalVisible(true)}
        >
          <Feather name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#4287f5' }]} 
          onPress={() => navigation.navigate('SalesScreen')}
        >
          <Text style={styles.menuButtonText}>Vendas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#42b883' }]} 
          onPress={() => navigation.navigate('ProductScreen')}
        >
          <Text style={styles.menuButtonText}>Produtos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#f5a742' }]} 
          onPress={() => navigation.navigate('CashBookScreen')}
        >
          <Text style={styles.menuButtonText}>Caixa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Configurações */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={configModalVisible}
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Configurações</Text>
            
            {/* Nova opção para configurar estoque mínimo */}
            <TouchableOpacity
              style={styles.configOption}
              onPress={() => {
                setConfigModalVisible(false);
                setStockConfigModalVisible(true);
              }}
            >
              <Feather name="box" size={20} color="#4287f5" style={styles.configIcon} />
              <Text style={styles.configText}>Configurar Estoque Mínimo</Text>
            </TouchableOpacity>
            
            {/* Opção existente para limpar banco */}
            <TouchableOpacity
              style={[styles.configOption, styles.dangerOption]}
              onPress={() => {
                setConfigModalVisible(false);
                setPasswordModalVisible(true);
              }}
            >
              <Feather name="trash-2" size={20} color="#ff6347" style={styles.configIcon} />
              <Text style={styles.configTextDanger}>Apagar Banco de Dados</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, {marginTop: 20}]}
              onPress={() => setConfigModalVisible(false)}
            >
              <Text style={styles.buttonTextDark}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Senha */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          setPasswordModalVisible(false);
          setPassword('');
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirmação de Segurança</Text>
            <Text style={styles.modalText}>
              Digite sua senha de login para confirmar:
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPassword('');
                }}
              >
                <Text style={styles.buttonTextDark}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePasswordConfirm}
              >
                <Text style={styles.buttonTextLight}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Novo Modal para Configuração de Estoque Mínimo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={stockConfigModalVisible}
        onRequestClose={() => setStockConfigModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Configurar Estoque Mínimo</Text>
            <Text style={styles.modalText}>
              Definir valor mínimo de estoque para alertas:
            </Text>
            
            <TextInput
              style={styles.stockInput}
              placeholder="Valor mínimo"
              keyboardType="numeric"
              value={minStockValue}
              onChangeText={setMinStockValue}
            />
            
            <Text style={styles.helpText}>
              Produtos com estoque abaixo deste valor serão destacados na lista de produtos.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setStockConfigModalVisible(false)}
              >
                <Text style={styles.buttonTextDark}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveMinStock}
              >
                <Text style={styles.buttonTextLight}>Salvar</Text>
              </TouchableOpacity>
            </View>
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
    display: 'flex',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative', 
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  configButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 20,
  },
  menuButton: {
    width: '100%',
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    width: '50%',
    height: 50,
    backgroundColor: '#ff6347',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#ff6347',
    fontWeight: 'bold',
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
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
  },
  confirmButton: {
    backgroundColor: '#4287f5',
  },
  buttonTextLight: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonTextDark: {
    color: '#333',
    fontWeight: 'bold',
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  
  configOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  dangerOption: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  configIcon: {
    marginRight: 10,
  },
  configText: {
    fontSize: 16,
    color: '#333',
  },
  configTextDanger: {
    fontSize: 16,
    color: '#ff6347',
    fontWeight: '500',
  },
  stockInput: {
    width: '50%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginVertical: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
