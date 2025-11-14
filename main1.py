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