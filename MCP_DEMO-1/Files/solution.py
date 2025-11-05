def two_sum(nums, target):
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.

    Args:
        nums (list): A list of integers.
        target (int): The target sum.

    Returns:
        list: A list containing the indices of the two numbers.
    """
    num_dict = {}  # Create an empty dictionary to store numbers and their indices
    for i, num in enumerate(nums):
        complement = target - num  # Calculate the complement of the current number
        if complement in num_dict:  # Check if the complement is already in the dictionary
            return [num_dict[complement], i]  # Return the indices of the complement and the current number
        num_dict[num] = i  # Store the current number and its index in the dictionary

    raise ValueError("No solution found")  # Raise an error if no solution is found


print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]