# test3.py

def fibonacci(n):
    """
    Generate Fibonacci series up to nth number.

    Args:
        n (int): The nth number in the Fibonacci series.

    Returns:
        list: A list containing the Fibonacci series up to nth number.
    """
    fib_series = [0, 1]
    while len(fib_series) < n:
        fib_series.append(fib_series[-1] + fib_series[-2])
    return fib_series

def main():
    # Generate and print the first 10 numbers in the Fibonacci series
    num_terms = 10
    print("Fibonacci Series up to {} terms:".format(num_terms))
    for i, num in enumerate(fibonacci(num_terms)):
        print("{}: {}".format(i+1, num))

if __name__ == "__main__":
    main()