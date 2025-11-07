#include <iostream>

int main() {
    int n;

    // Input the number of rows for the triangle
    std::cout << "Enter the number of rows: ";
    std::cin >> n;

    // Print hollow right triangle star pattern
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++) {
            std::cout << " ";
        }
        for (int k = 1; k <= 2 * i - 1; k++) {
            if (i == 1 || i == n || k == 1 || k == 2 * i - 1) {
                std::cout << "*";
            } else {
                std::cout << " ";
            }
        }
        std::cout << "\n";
    }

    return 0;
}