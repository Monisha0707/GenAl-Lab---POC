#include <iostream>
#include <algorithm>

int gcd(int a, int b) {
    if (b == 0)
        return a;
    return gcd(b, a % b);
}

int gcdThreeNumbers(int num1, int num2, int num3) {
    // Find the greatest common divisor of two numbers
    int gcdAB = gcd(num1, num2);
    
    // Now find the GCD of this result and the third number
    return gcd(gcdAB, num3);
}

int main() {
    int num1 = 48;
    int num2 = 18;
    int num3 = 36;

    std::cout << "The greatest common divisor of " 
              << num1 << ", " << num2 << ", and "
              << num3 << " is: " << gcdThreeNumbers(num1, num2, num3) << std::endl;

    return 0;
}