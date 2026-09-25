
    
# Copy



    inFrom 8
    inNext
inNext
one
outPrev
one
outPrev


    
#State: s1
A_s1: jmpt A_s1_1

# s1  0 - - Halt
A_s1_0:
halt

# s1  1 0 R s2
A_s1_1:
zero
out
inPrev
# Next: s2 
jmp A_s2

#State: s2
A_s2: jmpt A_s2_1

# s2  0 0 R s3
A_s2_0:
inPrev
# Next: s3 
jmp A_s3

# s2  1 1 R s2
A_s2_1:
inPrev
# Next: s2 
jmp A_s2

#State: s3
A_s3: jmpt A_s3_1

# s3  0 1 L s4
A_s3_0:
one
out
inNext
# Next: s4 
jmp A_s4

# s3  1 1 R s3
A_s3_1:
inPrev
# Next: s3 
jmp A_s3

#State: s4
A_s4: jmpt A_s4_1

# s4  0 0 L s5
A_s4_0:
inNext
# Next: s5 
jmp A_s5

# s4  1 1 L s4
A_s4_1:
inNext
# Next: s4 
jmp A_s4

#State: s5
A_s5: jmpt A_s5_1

# s5  0 1 R s1
A_s5_0:
one
out
inPrev
# Next: s1 
jmp A_s1

# s5  1 1 L s5
A_s5_1:
inNext
# Next: s5 
jmp A_s5
    

    
# Busy_Beaver

org 0x80

    inFrom 8
    

inPrev


    
#State: A
B_A: jmpt B_A_1

# A  0 1 L B
B_A_0:
one
out
inNext
# Next: B 
jmp B_B

# A  1 1 R C
B_A_1:
inPrev
# Next: C 
jmp B_C

#State: B
B_B: jmpt B_B_1

# B  0 1 R A
B_B_0:
one
out
inPrev
# Next: A 
jmp B_A

# B  1 1 L B
B_B_1:
inNext
# Next: B 
jmp B_B

#State: C
B_C: jmpt B_C_1

# C  0 1 R B
B_C_0:
one
out
inPrev
# Next: B 
jmp B_B

# C  1 1 - Halt
B_C_1:
halt
    