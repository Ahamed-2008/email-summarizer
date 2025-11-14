city_list = []
city = []
new_dictionary = {}
n = int(input())
for i in range(n):
    city1 = eval(input())
    city_list.append(city1)
for i in city_list:
    for j in i:
        density = i[j]["population"]/i[j]["area"]
        new_dictionary[j] = density
        city.append(j)

population_densities = list(new_dictionary.values())

hpd = max(population_densities)

for key, value in new_dictionary.items():
    if value == hpd:
        mcpd = key
print(new_dictionary[mcpd])



