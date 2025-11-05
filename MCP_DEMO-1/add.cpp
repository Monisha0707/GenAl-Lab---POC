#include <iostream>
int multiply(int a, int b, int c) {
	return a * b * c;
}

int main() {
	int a = 5;
	int b = 10;
	int c = 2;
	std::cout << "Result: " << multiply(a, b, c) << std::endl;
	return 0;
}