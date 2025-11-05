#include <iostream>
#include <vector>

// Function to perform addition using STL
int addNumbers(int num1, int num2) {
    return num1 + num2;
}

// Function to perform subtraction using STL
int subtractNumbers(int num1, int num2) {
    if (num2 > num1)
        throw std::runtime_error("Subtraction cannot result in a negative number");

    return num1 - num2;
}

// Function to perform division using STL
double divideNumbers(double num1, double num2) {
    if (num2 == 0)
        throw std::runtime_error("Division by zero is not allowed");

    return num1 / num2;
}

// Function to perform multiplication using STL
int multiplyNumbers(int num1, int num2) {
    return num1 * num2;
}

int main() {
    int number1 = 10;
    int number2 = 5;

    try {
        // Perform operations and print results
        std::cout << "Addition: " << addNumbers(number1, number2) << std::endl;
        std::cout << "Subtraction: " << subtractNumbers(number1, number2) << std::endl;
        std::cout << "Multiplication: " << multiplyNumbers(number1, number2) << std::endl;

        double result = divideNumbers(10.0, 5.0);
        if (result == static_cast<int>(result)) {
            result = static_cast<int>(result); // If result is an integer, convert it
        }
        std::cout << "Division: " << result << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}