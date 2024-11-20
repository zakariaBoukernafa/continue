# ================================== Antalyse Tutorial ================================== #
#                Learn how to use AI-powered coding assistance effectively                #
# ================================================================================= #

# SECTION 1: Chat Feature
# ----------------------
# Highlight this code and press [Ctrl/Cmd + J] to chat
# Try asking: "How does this sorting algorithm work?"

def merge_sort(numbers: list[int]) -> list[int]:
    """
    Sorts a list of integers using the merge sort algorithm.
    Args:
        numbers: List of integers to sort
    Returns:
        Sorted list of integers
    """
    if len(numbers) <= 1:
        return numbers
        
    mid = len(numbers) // 2
    left = merge_sort(numbers[:mid])
    right = merge_sort(numbers[mid:])
    
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    """Merges two sorted lists into one sorted list."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# SECTION 2: Code Enhancement
# -------------------------
# Highlight the code below and press [Ctrl/Cmd + I]
# Try asking: "Add error handling and input validation"

def quick_example(data: list) -> list:
    return sorted(data)

# SECTION 3: Autocomplete Practice
# ------------------------------
# Place cursor at the end of the line below and press [Enter]
# Press [Tab] to accept the suggestion
# test_numbers = [4, 2, 7, 1, 9, 3]
# assert merge_sort(

# ===================== Learn more at https://antalyse.com ======================= #