// filename: start_pattern.cpp

#include <iostream>
using namespace std;

/**
 * Prints a pattern like:
 *
 * A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 *
 * Where the first row contains one character, the second row two characters,
 * and so on up to n rows.
 */
void printStartPattern(int n) {
    for (int i = 1; i <= n; i++) { // Loop through each row
        for (char c = 'A'; c <= 'A' + i - 1; c++) { // Character incrementing loop
            cout << c << " "; // Print the current character and a space after it.
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    
    printStartPattern(n);
    
    return 0;
}