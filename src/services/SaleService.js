import db from '../database/database';
import ProductService from './ProductService';

class SaleService {
  // Gerar um número de venda sequencial
  async getNextSaleNumber() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT MAX(CAST(number AS INTEGER)) as maxNumber FROM sales',
          [],
          (_, { rows }) => {
            const maxNumber = rows._array[0]?.maxNumber || 0;
            const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
            resolve(nextNumber);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Otimize o método createSale para processar itens de maneira mais eficaz
  async createSale(saleData) {
    return new Promise((resolve, reject) => {
      const { number, client, phone, total, paymentMethod, items } = saleData;
      const date = new Date().toISOString().split('T')[0];
      
      console.log(`Criando venda #${number} com ${items.length} itens`);
      
      // Usar uma única transação para toda a operação
      db.transaction(tx => {
        // 1. Inserir a venda principal
        tx.executeSql(
          'INSERT INTO sales (number, client, phone, total, date, paymentMethod) VALUES (?, ?, ?, ?, ?, ?)',
          [number, client, phone, total, date, paymentMethod],
          (_, { insertId }) => {
            const saleId = insertId;
            console.log(`Venda criada com ID: ${saleId}`);
            
            let itemsProcessed = 0;
            
            // 2. Inserir cada item da venda individualmente
            items.forEach((item) => {
              const { id, price, saleQuantity, total: itemTotal } = item;
              
              tx.executeSql(
                'INSERT INTO sale_items (saleId, productId, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
                [saleId, id, saleQuantity, price, itemTotal],
                (_, { insertId: itemId }) => {
                  console.log(`Item ${id} adicionado com ID: ${itemId}`);
                  itemsProcessed++;
                  
                  // 3. Atualizar estoque quando o item for inserido
                  tx.executeSql(
                    'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                    [saleQuantity, id],
                    () => {
                      console.log(`Estoque do produto ${id} atualizado`);
                      
                      // 4. Resolver a promessa quando todos os itens estiverem processados
                      if (itemsProcessed === items.length) {
                        console.log(`Venda #${number} finalizada com sucesso!`);
                        resolve({
                          id: saleId,
                          number,
                          date,
                          paymentMethod
                        });
                      }
                    },
                    (_, error) => console.error(`Erro ao atualizar estoque: ${error.message}`)
                  );
                },
                (_, error) => console.error(`Erro ao inserir item: ${error.message}`)
              );
            });
            
            // Se não houver itens, resolver imediatamente
            if (items.length === 0) {
              resolve({
                id: saleId,
                number,
                date,
                paymentMethod
              });
            }
          },
          (_, error) => {
            console.error(`Erro ao criar venda: ${error.message}`);
            reject(error);
          }
        );
      }, 
      // Callback de erro de transação
      error => {
        console.error(`Erro na transação: ${error.message}`);
        reject(error);
      },
      // Callback de sucesso de transação (não é chamado se already resolved)
      () => {
        console.log('Transação completa');
      });
    });
  }

  // Corrija o método addSaleItem para garantir que está funcionando corretamente
  addSaleItem(tx, saleId, item) {
    return new Promise((resolve, reject) => {
      // O ERRO ESTÁ AQUI: as variáveis não estão sendo extraídas
      const { id, price, saleQuantity, total } = item;
      
      console.log(`Adicionando item à venda ${saleId}: produto=${id}, quantidade=${saleQuantity}, preço=${price}`);
      
      tx.executeSql(
        'INSERT INTO sale_items (saleId, productId, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
        [saleId, id, saleQuantity, price, total],
        (_, { insertId }) => {
          console.log('Item adicionado com ID:', insertId);
          resolve(insertId);
        },
        (_, error) => {
          console.error('Erro ao adicionar item:', error);
          reject(error);
        }
      );
    });
  }

  // Buscar todas as vendas
  getSales() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sales ORDER BY date DESC, id DESC',
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

  // Aprimorar o método getSaleDetails para garantir que todos os itens são carregados corretamente
  getSaleDetails(saleId) {
    return new Promise((resolve, reject) => {
      let sale = {};
      
      console.log(`Buscando detalhes da venda #${saleId}`);
      
      db.transaction(tx => {
        // Primeiro, buscar os dados básicos da venda
        tx.executeSql(
          'SELECT * FROM sales WHERE id = ?',
          [saleId],
          (_, { rows }) => {
            if (rows.length === 0) {
              console.warn(`Venda #${saleId} não encontrada`);
              resolve(null);
              return;
            }
            
            // Clone os dados para evitar problemas de referência
            sale = {...rows._array[0]};
            
            // Em seguida, buscar os itens com JOIN explícito e ORDER BY
            tx.executeSql(
              `SELECT 
                si.id, 
                si.productId, 
                si.quantity, 
                si.price, 
                si.total, 
                p.name, 
                p.code 
               FROM sale_items si 
               JOIN products p ON si.productId = p.id 
               WHERE si.saleId = ? 
               ORDER BY si.id`,
              [saleId],
              (_, { rows: itemsRows }) => {
                console.log(`Encontrados ${itemsRows.length} itens para a venda #${saleId}`);
                
                // Converter os tipos numéricos explicitamente
                const items = itemsRows._array.map(item => ({
                  ...item,
                  quantity: Number(item.quantity),
                  price: Number(item.price),
                  total: Number(item.total)
                }));
                
                sale.items = items;
                
                // Log completo para diagnóstico
                console.log(`Detalhes completos da venda #${saleId} com ${items.length} itens`);
                resolve(sale);
              },
              (_, error) => {
                console.error(`Erro ao buscar itens da venda #${saleId}: ${error.message}`);
                sale.items = [];
                resolve(sale);
              }
            );
          },
          (_, error) => {
            console.error(`Erro ao buscar venda #${saleId}: ${error.message}`);
            reject(error);
          }
        );
      });
    });
  }
  
  // Buscar resumo do caixa por período
  getCashSummary(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                      SUM(total) as totalSales, 
                      COUNT(*) as salesCount,
                      paymentMethod, 
                      date 
                     FROM sales 
                     WHERE date BETWEEN ? AND ?
                     GROUP BY date, paymentMethod
                     ORDER BY date DESC`;
      
      db.transaction(tx => {
        tx.executeSql(
          query,
          [startDate, endDate],
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
}

export default new SaleService();