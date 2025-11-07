// File: test.cpp

#include <iostream>
using namespace std;

// Function to find GCD of two numbers using STL (algorithm library)
int findGcd(int num1, int num2) {
    return __gcd(num1, num2);
}

// Function to find GCD of three numbers by finding the GCD of first two and then GCD of result with third number
int findThreeGcd(int num1, int num2, int num3) {
    int gcd = findGcd(num1, num2);  // Find the GCD of first two numbers
    return findGcd(gcd, num3);      // Then find the GCD of result with third number
}

int main() {
    int a = 12;
    int b = 15;
    int c = 21;

    cout << "The greatest common divisor (gcd) of three numbers is: ";
    cout << findThreeGcd(a, b, c);

    return 0;
}