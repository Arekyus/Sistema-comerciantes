import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Tentando inicializar o banco de dados...");
        // Verifique se expo-sqlite está disponível
        const SQLite = require('expo-sqlite');
        if (!SQLite) {
          throw new Error("Módulo expo-sqlite não encontrado");
        }
        
        await initDatabase();
        console.log("Banco de dados inicializado com sucesso!");
        setDbInitialized(true);
        setError(null);
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        // Adicione estas linhas para informações mais detalhadas:
        console.error('Mensagem do erro:', error.message);
        console.error('Stack trace completa:', error.stack);
        setError(`Erro: ${error.message || 'Erro desconhecido'}`);
        
        // Exibir informações mais detalhadas sobre o erro
        Alert.alert(
          "Erro de inicialização", 
          `Houve um problema ao iniciar o banco de dados: ${error.message}.\nVerifique os logs para mais detalhes.`
        );
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Inicializando aplicativo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro na inicialização</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  }
});
