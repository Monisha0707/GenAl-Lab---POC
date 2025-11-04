#include <iostream>
using namespace std;

// Function to calculate GCD of two numbers
int gcd(int a, int b) {
    return __gcd(a, b);
}

// Function to calculate GCD of three numbers using STL's gcd function (C++11 onwards)
int find_gcd_three(int x, int y, int z) {
    // Use std::gcd to find the greatest common divisor of two numbers
    return gcd(std::gcd(x, y), z);
}

// Function to print the result
void print_result(int result) {
    cout << "The GCD of three numbers is: " << result << endl;
}

int main() {
    // Test with sample values
    int num1 = 48;   // Divisible by other two numbers
    int num2 = 18;   // Divisible by the first number and another number (9 in this case)
    int num3 = 9;

    cout << "Input numbers: " << num1 << ", " << num2 << ", " << num3 << endl;

    int gcd_result = find_gcd_three(num1, num2, num3);

    // Print the result
    print_result(gcd_result);

    return 0;
}



Input numbers: 48, 18, 9
The GCD of three numbers is: 9