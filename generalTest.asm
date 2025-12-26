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
skip1 save 2 # reg[2] = 1
      jmpt skip2 # should jump
      not  # acc = 0 (should not happen)
skip2 save 3  # reg[3] = 1
      not  # acc = 0
      jmpt skip3   (should not jump)
      not
skip3 save 4 # reg[4] = 1
      jmpt skip4   (should jump)
      not
skip4 save 5

