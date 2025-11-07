# vowel.py

def count_vowels(input_str):
    """
    This function counts the number of vowels in a given string.

    Args:
        input_str (str): The input string for which vowels are to be counted.

    Returns:
        int: The total number of vowels found in the string.
    """
    
    # Initialize a counter variable to store the vowel count
    vowel_count = 0
    
    # Convert the string to lowercase to handle all cases (upper and lower)
    input_str = input_str.lower()
    
    # Iterate over each character in the string
    for char in input_str:
        # Check if the character is a vowel ('a', 'e', 'i', 'o', or 'u')
        if char in ['a', 'e', 'i', 'o', 'u']:
            # If it's a vowel, increment the counter
            vowel_count += 1
    
    # Return the total count of vowels found
    return vowel_count


# Example usage:
input_str = "Hello World!"
vowel_count = count_vowels(input_str)

print("Input String:", input_str)
print("Number of Vowels:", vowel_count)