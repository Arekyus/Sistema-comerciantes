import db from '../database/database';

class ProductService {
  // Buscar todos os produtos
  getAllProducts() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products',
          [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Buscar um produto pelo ID
  getProductById(id) {
    return new Promise((resolve, reject) => {
      console.log('Buscando produto com ID:', id);
      
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              console.log('Produto encontrado:', rows._array[0]);
              resolve(rows._array[0]);
            } else {
              console.warn('Produto não encontrado com ID:', id);
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Erro ao buscar produto:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Adicionar novo produto
  addProduct(product) {
    return new Promise((resolve, reject) => {
      const { code, name, price, costPrice, quantity } = product;
      
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO products (code, name, price, costPrice, quantity) VALUES (?, ?, ?, ?, ?)',
          [code, name, parseFloat(price), parseFloat(costPrice) || 0, parseInt(quantity) || 0],
          (_, { insertId }) => {
            resolve(insertId);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Atualizar um produto
  updateProduct(product) {
    return new Promise((resolve, reject) => {
      const { id, code, name, price, costPrice, quantity } = product;
      console.log('Atualizando produto:', product);
      
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE products SET code = ?, name = ?, price = ?, costPrice = ?, quantity = ? WHERE id = ?',
          [code, name, price, costPrice, quantity, id],
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              console.log('Produto atualizado com sucesso');
              resolve(true);
            } else {
              console.warn('Nenhum produto foi atualizado');
              resolve(false);
            }
          },
          (_, error) => {
            console.error('Erro ao atualizar produto:', error);
            reject(error);
          }
        );
      });
    });
  }

  // Excluir um produto
  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM products WHERE id = ?',
          [id],
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Atualizar estoque de um produto
  updateStock(productId, quantity) {
    return new Promise((resolve, reject) => {
      console.log(`Atualizando estoque: produto ${productId}, quantidade ${quantity}`);
      
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [quantity, productId],
          (_, { rowsAffected }) => {
            console.log(`Estoque atualizado: ${rowsAffected} linhas afetadas`);
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error(`Erro ao atualizar estoque do produto ${productId}:`, error);
            reject(error);
          }
        );
      });
    });
  }
}

export default new ProductService();