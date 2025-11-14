arr = [2, 6, 7, 3, 4, 5]
#Insertion_sort
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr


print(insertion_sort(arr))

#Quick sort
def quick_sort(arr):
    if len(arr)<=1:
        return arr
    else:
        pivot = arr[0]
        left = [i for i in arr if i<pivot]
        right = [i for i in arr if i>pivot]
        return quick_sort(left)+[pivot]+quick_sort(right)

print(quick_sort(arr))

#merge sort
def merge(left, right):
    result = []
    i = j = 0
    while i<len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i+=1
        else:
            result.append(right[j])
            j+=1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    else:
        mid = len(arr)//2

        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])

        return merge(left, right)

print(merge_sort(arr))

#Selection sort
def selection_sort(arr):
    n = len(arr)
    for i in range(len(arr)):
        min_index = i
        for j in range(i+1, n):
            if arr[j] < arr[i]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr

print(selection_sort(arr))

#binary search
l=["hi","bye","cya"]
x="hi"
l.sort()
def bsearch(l,x):
    lb=0
    ub=len(l)-1
    while lb<=ub:
        mid=(lb+ub)//2
        if l[mid]==x:
            return mid
        elif x<l[mid]:
            ub=mid-1
        else:
            lb=mid+1
    return -1
r=bsearch(l,x)
if r!=-1:
    print(r)
else:
    print("not found")