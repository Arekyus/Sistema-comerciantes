import * as SQLite from 'expo-sqlite';

// Abrir ou criar o banco de dados
const db = SQLite.openDatabase('comerciantes.db');

// Melhore a estrutura do initDatabase
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Abrindo conexão com o banco de dados");
      
      // Faça uma operação simples para verificar se o banco está acessível
      db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, (error) => {
        if (error) {
          console.error("Erro ao configurar banco de dados:", error);
          return reject(error);
        }
        
        console.log("Conexão com banco de dados estabelecida");
        
        // Use uma única transação para todas as operações
        db.transaction(tx => {
          console.log("Iniciando criação de tabelas");
          
          // Tabela de produtos
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              code TEXT NOT NULL,
              name TEXT NOT NULL,
              price REAL NOT NULL,
              costPrice REAL,
              quantity INTEGER DEFAULT 0
            );`,
            [],
            () => console.log("Tabela de produtos criada com sucesso"),
            (_, error) => {
              console.error("Erro ao criar tabela de produtos:", error);
              return false; // Interrompe a transação
            }
          );
          
          // Tabela de vendas
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sales (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              number TEXT NOT NULL,
              client TEXT,
              phone TEXT,
              total REAL NOT NULL,
              date TEXT NOT NULL,
              paymentMethod TEXT NOT NULL
            );`,
            [],
            () => console.log("Tabela de vendas criada com sucesso"),
            (_, error) => {
              console.error("Erro ao criar tabela de vendas:", error);
              return false; // Interrompe a transação
            }
          );
          
          // Tabela de itens da venda
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sale_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              saleId INTEGER NOT NULL,
              productId INTEGER NOT NULL,
              quantity INTEGER NOT NULL,
              price REAL NOT NULL,
              total REAL NOT NULL,
              FOREIGN KEY (saleId) REFERENCES sales (id),
              FOREIGN KEY (productId) REFERENCES products (id)
            );`,
            [],
            () => console.log("Tabela de itens de venda criada com sucesso"),
            (_, error) => {
              console.error("Erro ao criar tabela de itens de venda:", error);
              return false; // Interrompe a transação
            }
          );
        }, 
        (transactionError) => {
          console.error("Erro na transação:", transactionError);
          reject(transactionError);
        },
        () => {
          console.log("Todas as tabelas foram criadas com sucesso");
          resolve(true);
        });
      });
    } catch (error) {
      console.error("Erro ao configurar banco de dados:", error);
      reject(error);
    }
  });
};

export default db;