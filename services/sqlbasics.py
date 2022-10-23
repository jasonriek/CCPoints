import os
import sqlite3

INTEGER = 'INTEGER'
TEXT = 'TEXT'
REAL = 'REAL'
BLOB = 'BLOB'

def formatToTableName(table_name:str):
    table_name = table_name.upper().strip()
    table_split = table_name.split()
    table_name = '_'.join(table_split)
    return table_name

def handlePluralSearchKeyEntires(search_key):
    '''Very simplistic, needs more attention for improved results.'''
    if len(search_key) > 1:
        if len(search_key) > 2:
            if search_key[-2] + search_key[-1] == 'es':
                search_key = search_key[0:-2]

            elif search_key[-1] == 's':
                search_key = search_key[0:-1]
    return search_key

class SQLBasics:
    @staticmethod
    def createTable(table_name:str, columns:dict, db_path:str):
        '''SQL WRAPPER: Creates a table in the bids database.'''
        database = None
        try:
            tb_columns = ',\n'.join([f'{col_nm} {col_type}' for col_nm, col_type in columns.items()])
            sql = f'''
            CREATE TABLE IF NOT EXISTS {formatToTableName(table_name)}
            (id INTEGER PRIMARY KEY,
            {tb_columns}
            );
            '''
            database = sqlite3.connect(db_path) 
            cursor = database.cursor()
            cursor.execute(sql)
            database.commit()

        except Exception as error:
            print(f'SQLBasics.createTable({table_name}, {columns}) Error: {str(error)}')
        finally:
            if database:
                database.close()

    @staticmethod
    def insert(table_name:str, data:dict, db_path:str):
        '''SQL WRAPPER: Inserts dictionary values in a specified table.
            EXAMPLE:
            
            data {
                "ITEM_ID": 25 # <column name>: <value>
            }
        '''
        database = None 
        sql = ''
        try:
            columns = list(data.keys())
            values = [data[column] for column in columns]
            columns_sql = ','.join(columns)
            values_sql = ','.join(['?' for _ in values])
            sql = f'INSERT INTO {table_name} ({columns_sql}) VALUES ({values_sql});'
            database = sqlite3.connect(db_path)
            cur = database.cursor()
            cur.execute(sql, values)
            database.commit()

        except Exception as error:
            print(f'SQLBasics.insert({table_name}, {data}) Error: {str(error)}\n\nSQL: {sql}')
        
        finally:
            if database:
                database.close()

    @staticmethod
    def remove(table_name:str, cond_col:str, cond_val, db_path:str):
        '''Remove rows from a table where a column is equal to some value.'''
        database = None 
        try:
            sql = f'DELETE FROM {table_name} WHERE {cond_col} = ?;'
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            cursor.execute(sql, [cond_col])
            database.commit()
        except Exception as error:
            print(f'SQLBasics.remove({table_name},{cond_col},{cond_val}) Error: {str(error)}')
        finally:
            if database:
                database.close()

    @staticmethod
    def update(table_name:str, col:str, val, cond_col:str, cond_val, db_path:str):
        '''Update some value from a table.'''
        con = None 
        try:
             sql = f'UPDATE {table_name} SET {col} = ? WHERE {cond_col} = ?;'
             con = sqlite3.connect(db_path)
             cursor = con.cursor()
             cursor.execute(sql, [val, cond_val])
             con.commit()

        except Exception as error:
            print(f'Vendors.update({table_name}, {col}, {val}, {cond_col}, {cond_val}) Error: {str(error)}')
        finally:
            if con:
                con.close()

    @staticmethod
    def value(table_name:str, col:str, cond_col:str, cond_val, db_path:str):
        '''A specific value from a table.'''
        database = None 
        value = None 
        try:
            sql = f'SELECT {col} FROM {table_name} WHERE {cond_col} = ?;'
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            value = cursor.execute(sql, [cond_val]).fetchone()
            if value:
                value = value[0] 
        except Exception as error:
            print(f'SQLBasics.value({table_name}, {col}, {cond_col}, {cond_val}) Error: {str(error)}')
        finally:
            if database:
                database.close()
        return value        

    @staticmethod
    def getRow(table_name:str, item_id_column_name:str, item_id:str, db_path:str):
        '''SQL WRAPPER: Returns the values from a selected row based on the passed table name and item id.'''
        database = None 
        values = []
        try:
            sql = f'SELECT * FROM {table_name} WHERE {item_id_column_name} = ?;'
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            columns = cursor.execute(sql,[item_id]).fetchone()
            if columns:
                values =  [value for value in columns]
        except Exception as error:
            print(f'SQLBasics.getRow({table_name}, {item_id}) Error: {str(error)}')
        finally:
            if database:
                database.close()
        return values

    @staticmethod    
    def getPlayers():
        '''SQL WRAPPER: Returns the values from a selected row based on the passed table name and item id.'''
        database = None 
        dir_name = os.path.dirname(__file__)
        db_name= os.path.join(dir_name, 'wheelspins.db') 
        values = []
        try:
            sql = f'SELECT PLAYER_NAME, PLAYER_ID, WHEEL_SPIN_COUNT FROM PLAYERS WHERE ACTIVE = 1 ORDER BY PLAYER_NAME;'
            database = sqlite3.connect(db_name)
            cursor = database.cursor()
            columns = cursor.execute(sql).fetchall()
            if columns:
                values =  [value for value in columns]
        except Exception as error:
            print(f'SQLBasics.getPlayers() Error: {str(error)}')
        finally:
            if database:
                database.close()
        return values

    @staticmethod
    def getColumn(table_name:str, column_name:str, db_path:str):
        '''SQL WRAPPER: Returns values from a selected column based on the passed table table name and column name.'''
        database = None
        dir_name = os.path.dirname(__file__)
        db_path = os.path.join(dir_name, db_path) 
        values = []
        try:
            sql = f'SELECT {column_name} FROM {table_name};'
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            values =  [row[0] for row in cursor.execute(sql).fetchall() if row]

        except Exception as error:
            print(f'SQLBasics.getColumn({table_name}, {column_name}) Error: {str(error)}')
        
        finally:
            if database:
                database.close()
        return values       

    @staticmethod
    def getColumnByID(table_name:str, column_name:str, item_id_column_name:str, item_id:str, db_path:str):
        '''SQL WRAPPER: Returns values from a selected column based on the passed table table name and column name.'''
        dir_name = os.path.dirname(__file__)
        db_path = os.path.join(dir_name, db_path)
        database = None 
        values = []
        try:
            sql = f'SELECT {column_name} FROM {table_name} WHERE {item_id_column_name} = ?;'
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            values =  [row[0] for row in cursor.execute(sql, [item_id]).fetchall() if row]

        except Exception as error:
            print(f'SQLBasics.getColumnByID({table_name}, {column_name}, {item_id_column_name}, {item_id}) Error: {str(error)}')
        
        finally:
            if database:
                database.close()
        return values  

    @staticmethod
    def tableNames(db_path:str):
        '''Returns a list containing all of the database's table names.'''
        database = None
        table_name_sql = ''
        table_names = []
        try:
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            table_name_sql = "SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';"
            table_names = [table[0] for table in cursor.execute(table_name_sql).fetchall()]
        except Exception as error:
            print(f'SQLBasics.tableNames({db_path}) Error: {str(error)}\n\nSQL: {table_name_sql}')
        finally:
            if database:
                database.close()
        return table_names
    
    @staticmethod
    def rowCount(table_name:str, db_path:str):
        '''Checks the table row count.'''
        database = None 
        count = 0
        try:
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            sql = f'SELECT COUNT(*) FROM {table_name};'
            count = int(cursor.execute(sql).fetchone()[0])
        except Exception as error:
            print(f'SQLBasics.rowCount({table_name}, {db_path}) Error: {str(error)}')
        finally:
            if database:
                database.close()
        return count

    @staticmethod
    def searchTable(table_name:str, db_path:str, search_key:str='', default=False):
        database = None
        db_data = []
        #multi_keys = []
        search_key = search_key.lower().strip()
        try:
            database = sqlite3.connect(db_path)
            cursor = database.cursor()
            #if ',' in search_key:
            #    multi_keys = [key.strip() for key in search_key.split(',')]

            if default:
                sql = f"""
                        SELECT * FROM {table_name};
                    """
                db_data = cursor.execute(sql).fetchall()

            # FUTURE USE
            #elif SearchDictionary.hasWord(search_key):
            #    words, sql = SearchDictionary.searchString(search_key, table_name)
            #    db_data = cursor.execute(sql, words).fetchall()

            else:
                new_search_key = handlePluralSearchKeyEntires(search_key)
                sql = f"""
                        SELECT * FROM {table_name} WHERE INSTR(LOWER(DESCRIPTION), '{new_search_key}') > 0 OR INSTR(LOWER(PROD_ID), '{search_key}') > 0;
                    """
                new_search_key = search_key
                db_data = cursor.execute(sql).fetchall() 

        except Exception as error:
            print(f'SQLBasics.searchTable(search_key: {search_key}, default: {str(default)}) Error:', error)
        finally:
            if database:
                database.close()
        return db_data