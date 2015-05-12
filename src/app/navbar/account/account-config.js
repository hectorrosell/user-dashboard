/*
 * Copyright (c) 2015 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

import AddCreditcardCtrl from '../account/creditcard/add-creditcard.controller';
import AddCreditcard from '../account/creditcard/add-creditcard.directive';

class AccountConfig {

  constructor(register) {
    register.controller('AddCreditcardCtrl', AddCreditcardCtrl);
    register.directive('AddCreditcard', AddCreditcard);
  }
}

export default AccountConfig;
