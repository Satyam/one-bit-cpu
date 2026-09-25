
    
# Copy



    
    #moveLeft
zero
outTo 0
in
#moveLeft
zero
outTo 0
in
#rightPrint1
one
outTo 0
outTo 1
#rightPrint1
one
outTo 0
outTo 1


    
#State: s1
C_s1: jmpt C_s1_1

# s1  0 - - Halt
C_s1_0:
halt

# s1  1 0 R s2
C_s1_1:
#print0
zero
outto 1
#moveRight
one
outTo 0
in
# Next: s2 
jmp C_s2

#State: s2
C_s2: jmpt C_s2_1

# s2  0 0 R s3
C_s2_0:
#moveRight
one
outTo 0
in
# Next: s3 
jmp C_s3

# s2  1 1 R s2
C_s2_1:
#moveRight
one
outTo 0
in
# Next: s2 
jmp C_s2

#State: s3
C_s3: jmpt C_s3_1

# s3  0 1 L s4
C_s3_0:
#print1
one
outTo 1
#moveLeft
zero
outTo 0
in
# Next: s4 
jmp C_s4

# s3  1 1 R s3
C_s3_1:
#moveRight
one
outTo 0
in
# Next: s3 
jmp C_s3

#State: s4
C_s4: jmpt C_s4_1

# s4  0 0 L s5
C_s4_0:
#moveLeft
zero
outTo 0
in
# Next: s5 
jmp C_s5

# s4  1 1 L s4
C_s4_1:
#moveLeft
zero
outTo 0
in
# Next: s4 
jmp C_s4

#State: s5
C_s5: jmpt C_s5_1

# s5  0 1 R s1
C_s5_0:
#print1
one
outTo 1
#moveRight
one
outTo 0
in
# Next: s1 
jmp C_s1

# s5  1 1 L s5
C_s5_1:
#moveLeft
zero
outTo 0
in
# Next: s5 
jmp C_s5
    

    
# Busy_Beaver

org 0x80

    
    

#moveRight
one
outTo 0
in


    
#State: A
D_A: jmpt D_A_1

# A  0 1 L B
D_A_0:
#print1
one
outTo 1
#moveLeft
zero
outTo 0
in
# Next: B 
jmp D_B

# A  1 1 R C
D_A_1:
#moveRight
one
outTo 0
in
# Next: C 
jmp D_C

#State: B
D_B: jmpt D_B_1

# B  0 1 R A
D_B_0:
#print1
one
outTo 1
#moveRight
one
outTo 0
in
# Next: A 
jmp D_A

# B  1 1 L B
D_B_1:
#moveLeft
zero
outTo 0
in
# Next: B 
jmp D_B

#State: C
D_C: jmpt D_C_1

# C  0 1 R B
D_C_0:
#print1
one
outTo 1
#moveRight
one
outTo 0
in
# Next: B 
jmp D_B

# C  1 1 - Halt
D_C_1:
halt
    