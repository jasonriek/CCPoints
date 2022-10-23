import sys
import csv
import os 
from sqlbasics import SQLBasics
from sqlite3.dbapi2 import Cursor
from datetime import datetime

DB_FILENAME = 'wheelspins.db'
DB_BAK_DIR = 'db_BAK'

PLAYERS_TABLE = 'PLAYERS'
PLAYER_ID_COL = 'PLAYER_ID'
PLAYER_NAME_COL = 'PLAYER_NAME'

WHEEL_SPINS_TABLE = 'WHEEL_SPINS'
WHEEL_SPIN_NUMBER_COL = 'WHEEL_SPIN_NUMBER'
TIME_ENTERED_COL = 'TIME_ENTERED'

def writeReport():
    dir_name = os.path.dirname(__file__)
    wheel_spin_history_dir = os.path.join(dir_name, 'wheel_spin_history')
    report_file_name = f'wheel_spins_{datetime.now().strftime("%m_%d_%Y")}.csv'
    report_file_path = os.path.join(wheel_spin_history_dir, report_file_name)
    PLAYER_HEADERS = ['Player Name', 'Player ID', 'Wheel Spin Count', 'Wheel Spins']
    player_rows = SQLBasics.getPlayers()
    
    with open(report_file_path, 'w', newline='') as report:
        report_writer = csv.writer(report)
        for player_row in player_rows:
            player_row = list(player_row)
            player_id = player_row[1]
            report_writer.writerow(PLAYER_HEADERS)
            wheel_spins = SQLBasics.getColumnByID(WHEEL_SPINS_TABLE, WHEEL_SPIN_NUMBER_COL, PLAYER_ID_COL, player_id, DB_FILENAME)
            if not wheel_spins:
                wheel_spins = ['(!) No wheel spins error']
            player_row.append(wheel_spins[0])
            report_writer.writerow(player_row)
            for wheel_spin in [wheel_spins[i] for i in range(1, len(wheel_spins))]:
                report_writer.writerow(['', '', '', wheel_spin])
            report_writer.writerow(['\n'])
    return report_file_name

def backupDatabase():
    dir_path = os.path.dirname(__file__)
    db_file_name = f"wheelspins_{datetime.now().strftime('%m_%d_%Y')}.db"
    db_back_path = os.path.join(dir_path, DB_BAK_DIR, db_file_name)
    db_path = os.path.join(dir_path, DB_FILENAME)
    os.popen(f'cp {db_path} {db_back_path}')

if __name__ == '__main__':
    try:
        file_name = writeReport()
        print(file_name)
        backupDatabase()
    except Exception as error:
        print(f'DB ERROR: {error}')
    sys.stdout.flush()