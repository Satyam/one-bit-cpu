# Since RAM locations cannot be shown in timing diagram, I must output all results on I/O ports

# Check that outputs can go to various addresses (doesn't matter which data)
# (basically, check DataAddress and Write pins)
      outTo 0
      outTo 3
      outTo 1
      outTo 2
      outTo 1024

      out       # Also check that out remembers the previous address


# Now check sending a 0 and a 1. (check DataOut pin)
# Since I will be using the `out` instruction with always the same address
# I have to check that one as well.
      outTo 1   #set a fixed DataAdress so the rest of `out`s go there.

# Check ONE and ZERO
      zero
      out       # Acc should be zero
      one       # Acc should be 1
      out       # port address 1 now 1.

# Now store data in regs and output it to ensure it got there.
      one
      save 0      # save ones in regs 0 and 2
      save 2
      zero
      save 1
      save 3

# check all regs from 0 to 3
      load 0
      out         # should be 1
      load 1
      out         # should be 0
      load 2
      out         # should be 1
      load 3
      out         # should be 0

# Check logical operations on the Acc
      zero
      save 0      # get a 0 into reg 0
      one
      save 1      # get a 1 into reg 1
# test and
      and 0
      out       # 1 and 0 => 0

      one
      and 1
      out       # should be 1

      zero
      and 1
      out       # should be zero

      zero
      and 0
      out       # should be zero

#test OR
      one
      or 0
      out       # 1 and 0 => 1

      one
      or 1
      out       # should be 1

      zero
      or 1
      out       # should be 1

      zero
      and 0
      out       # should be 0

# Test NOT
      zero
      not
      out         # should be 1
      not
      out         # should be 0

# check in and out with increment and decrement.
#outs
      one
      outTo 0     # should go to 0
      out         # should go to 0
      outNext     # should go to 1
      outNext     # should go to 2
      out         # should go to 2
      outPrev     # should go to 1
      outPrev     # should go to 0
# ins
      inFrom 0    # should come from 0
      in          # should come from 0
      inNext      # should come from 1
      inNext      # should come from 2
      in          # should come from 2
      inPrev      # should come from 1
      inPrev      # should come from 0

# keep the following zeros at the end of the usable part
# to let the signals settle from the last usable instruction

      zero
      zero

# Nothing to see here

       one #acc = 1
       save 0  # reg[0] = 1
       zero  # acc = 0
       or 0  # acc = 1
       save 1  # reg[1] = 1
       and 1 # acc = 1
       not # acc = 0
       and 1 # acc = 0
       load 0 # acc = 1
       zero # acc = 0
       load 1 # acc 1
       jmp skip1
       not # acc = 0  (should not happen)
skip1: save 2 # reg[2] = 1
       jmpt skip2 # should jump
       not  # acc = 0 (should not happen)
skip2: save 3  # reg[3] = 1
       not  # acc = 0
       jmpt skip3   #(should not jump)
       not
skip3: save 4 # reg[4] = 1
       jmpt skip4   #(should jump)
       not
skip4: save 5
       one
       outTo 2
       not
       outTo 3
       inFrom 0
       inFrom 1


